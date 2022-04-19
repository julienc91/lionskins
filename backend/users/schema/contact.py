import graphene
import structlog
from graphql import GraphQLError

from users.serializers.contact import ContactSerializer

logger = structlog.get_logger()


class ContactMutation(graphene.Mutation):
    class Arguments:
        name = graphene.String()
        email = graphene.String()
        message = graphene.String(required=True)
        captcha = graphene.String(required=True)

    message_id = graphene.Field(graphene.String, name="id")

    @classmethod
    def mutate(cls, root, info, *args, **kwargs):
        serializer = ContactSerializer(context={"request": info.context}, data=kwargs)
        if not serializer.is_valid():
            raise GraphQLError(serializer.errors)

        contact = serializer.save()
        return cls(message_id=contact.id)


class Mutation(graphene.ObjectType):
    contact = ContactMutation.Field()
