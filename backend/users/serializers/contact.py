import structlog
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from lionskins.utils.captcha import check_captcha
from lionskins.utils.ip_address import get_client_ip
from users.models import Contact

logger = structlog.get_logger()


class ContactSerializer(serializers.ModelSerializer):
    """
    Serializer for Contact model
    """

    captcha = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = Contact
        fields = ["id", "captcha", "name", "email", "message", "user"]
        read_only_fields = ["id", "user"]
        extra_kwargs = {
            "name": {"allow_null": True},
            "email": {"allow_null": True},
        }

    def validate_captcha(self, value):
        ip_address = get_client_ip(self.context["request"])
        if not check_captcha(value, ip_address):
            raise ValidationError("Invalid captcha")
        return value

    @staticmethod
    def validate_name(value):
        return value or ""

    @staticmethod
    def validate_email(value):
        return value or ""

    def create(self, validated_data):
        if self.context["request"].user.is_authenticated:
            validated_data["user"] = self.context["request"].user
        else:
            validated_data["user"] = None
        validated_data.pop("captcha")
        res = super().create(validated_data)
        try:
            res.send()
        except Exception as e:
            logger.exception(e)
        return res
