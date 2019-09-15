# -*- coding: utf-8 -*-

from datetime import datetime

import graphene
from flask_jwt_extended import jwt_required
from graphql_relay.node.node import from_global_id

from ...models import List
from ...utils.users import get_current_user
from .types import TypeList, ListConnection


class CreateList(graphene.Mutation):
    class Input:
        name = graphene.String(required=True)
        description = graphene.String()

    list = graphene.Field(TypeList)

    @classmethod
    @jwt_required
    def mutate(cls, *args, **kwargs):
        user = get_current_user()
        name = kwargs['name']
        slug = List.generate_slug(user, name)

        description = kwargs.get("description") or ""
        list_ = List.create(user=user, name=name, slug=slug, description=description)
        return cls(list=list_)


class UpdateList(graphene.Mutation):
    class Input:
        id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()

    list = graphene.Field(TypeList)

    @classmethod
    @jwt_required
    def mutate(cls, *args, **kwargs):
        user = get_current_user()
        _, list_id = from_global_id(kwargs['id'])
        list_ = List.filter(user=user, id=list_id).first()
        if not list_:
            return cls(list=None)

        if 'description' in kwargs:
            list_.description = kwargs['description']
        if kwargs.get('name') and kwargs['name'] != list_.name:
            list_.name = kwargs['name']
            list_.slug = List.generate_slug(list_.user, list_.name)
        list_.update_date = datetime.now()
        list_.save()
        return cls(list=list_)


class DeleteList(graphene.Mutation):
    class Input:
        id = graphene.ID(required=True)

    ok = graphene.Boolean()

    @classmethod
    @jwt_required
    def mutate(cls, *args, **kwargs):
        user = get_current_user()
        _, list_id = from_global_id(kwargs['id'])
        list_ = List.filter(user=user, id=list_id).first()
        if not list_:
            return cls(ok=True)
        list_.delete()
        return cls(ok=True)


class Mutation(graphene.ObjectType):
    create_list = CreateList.Field()
    update_list = UpdateList.Field()
    #add_item = AddItem.Field()
    #remove_item = RemoveItem.Field()
    delete_list = DeleteList.Field()


class Query(graphene.ObjectType):
    current_user_lists = graphene.relay.ConnectionField(
        ListConnection
    )
    user_list = graphene.Field(TypeList, id=graphene.ID(required=True))

    def resolve_user_list(self, info, **kwargs):
        _, list_id = from_global_id(kwargs['id'])
        list_ = List.filter(id=list_id).first()
        return list_

    @jwt_required
    def resolve_current_user_lists(self, info, **kwargs):
        user = get_current_user()
        lists = List.filter(user=user)
        return lists
