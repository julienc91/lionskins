# -*- coding: utf-8 -*-

from datetime import datetime

import graphene
from flask_jwt_extended import jwt_required
from graphql import GraphQLError
from graphql_relay.node.node import from_global_id

from api.lists.types import ListConnection, TypeList
from models import List
from models.csgo import Skin
from models.lists import Item, ItemContainer
from utils.users import get_current_user


def get_list_from_id(list_id):
    user = get_current_user()
    _, list_id = from_global_id(list_id)
    list_ = List.filter(user=user, id=list_id).first()
    if not list_:
        raise GraphQLError("No list with this id")
    return list_


class CreateList(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String()

    list = graphene.Field(TypeList)

    @classmethod
    @jwt_required()
    def mutate(cls, *args, **kwargs):
        user = get_current_user()
        name = kwargs["name"]
        if not name:
            raise GraphQLError("Invalid name")
        slug = List.generate_slug(user, name)

        description = kwargs.get("description") or ""
        list_ = List.create(user=user, name=name, slug=slug, description=description)
        return cls(list=list_)


class UpdateList(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()

    list = graphene.Field(TypeList)

    @classmethod
    @jwt_required()
    def mutate(cls, *args, **kwargs):
        list_ = get_list_from_id(kwargs["id"])

        if "description" in kwargs:
            list_.description = kwargs["description"]
        if kwargs.get("name") and kwargs["name"] != list_.name:
            list_.name = kwargs["name"]
            list_.slug = List.generate_slug(list_.user, list_.name)
        list_.update_date = datetime.now()
        list_.save()
        return cls(list=list_)


class DeleteList(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    ok = graphene.Boolean()

    @classmethod
    @jwt_required()
    def mutate(cls, *args, **kwargs):
        list_ = get_list_from_id(kwargs["id"])
        list_.delete()
        return cls(ok=True)


class AddItems(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        item_ids = graphene.List(graphene.ID, required=True)
        container_id = graphene.Int()

    list = graphene.Field(TypeList)

    @classmethod
    @jwt_required()
    def mutate(cls, *args, **kwargs):
        list_ = get_list_from_id(kwargs["id"])

        item_ids = []
        for item_id in kwargs["item_ids"]:
            _, item_id = from_global_id(item_id)
            item_ids.append(item_id)

        skins = Skin.filter(id__in=item_ids)
        if not skins:
            return cls(list=list_)

        container_id = kwargs.get("container_id")
        if container_id is None:
            container = ItemContainer.create()
            for skin in skins:
                item = Item.create(skin=skin)
                container.items.append(item)
            list_.item_containers.append(container)
        else:
            container = list_.item_containers[container_id]
            existing_item_ids = {item.skin.id for item in container.items}
            for skin in skins:
                if skin.id in existing_item_ids:
                    continue
                item = Item.create(skin=skin)
                container.items.append(item)
        list_.save()
        return cls(list=list_)


class DeleteContainer(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        container_id = graphene.Int(required=True)

    list = graphene.Field(TypeList)

    @classmethod
    @jwt_required()
    def mutate(cls, *args, **kwargs):
        list_ = get_list_from_id(kwargs["id"])

        container_id = kwargs["container_id"]
        list_.item_containers.pop(container_id)
        list_.save()
        return cls(list=list_)


class MoveContainer(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        container_id = graphene.Int(required=True)
        new_container_id = graphene.Int(required=True)

    list = graphene.Field(TypeList)

    @classmethod
    @jwt_required()
    def mutate(cls, *args, **kwargs):
        list_ = get_list_from_id(kwargs["id"])

        container_id = kwargs["container_id"]
        new_container_id = kwargs["new_container_id"]
        container = list_.item_containers.pop(container_id)
        list_.item_containers.insert(new_container_id, container)
        list_.save()
        return cls(list=list_)


class RemoveItems(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        item_ids = graphene.List(graphene.ID, required=True)
        container_id = graphene.Int(required=True)

    list = graphene.Field(TypeList)

    @classmethod
    @jwt_required()
    def mutate(cls, *args, **kwargs):
        list_ = get_list_from_id(kwargs["list_id"])

        item_ids = []
        for item_id in kwargs["item_ids"]:
            _, item_id = from_global_id(item_id)
            item_ids.append(item_id)

        container_id = kwargs["container_id"]
        container = list_.item_containers[container_id]
        items = []
        for item in container.items:
            if item.skin.id not in item_ids:
                items.append(item)
        container.items = items
        if not items:
            list_.item_containers.pop(container_id)
        list_.save()
        return cls(list=list_)


class Mutation(graphene.ObjectType):
    create_list = CreateList.Field()
    update_list = UpdateList.Field()
    delete_list = DeleteList.Field()

    add_items = AddItems.Field()
    remove_items = RemoveItems.Field()
    delete_container = DeleteContainer.Field()
    move_container = MoveContainer.Field()


class Query(graphene.ObjectType):
    current_user_lists = graphene.relay.ConnectionField(ListConnection)
    user_list = graphene.Field(TypeList, id=graphene.ID(required=True))

    def resolve_user_list(self, info, **kwargs):
        _, list_id = from_global_id(kwargs["id"])
        list_ = List.filter(id=list_id).first()
        return list_

    @jwt_required()
    def resolve_current_user_lists(self, info, **kwargs):
        user = get_current_user()
        lists = List.filter(user=user)
        return lists
