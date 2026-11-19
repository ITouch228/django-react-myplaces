from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("places", "0002_check_checkitem_delete_entry")]

    operations = [
        migrations.AddField(
            model_name="checkitem",
            name="quantity",
            field=models.PositiveIntegerField(
                default=1,
                validators=[MinValueValidator(1), MaxValueValidator(10000)],
            ),
        ),
    ]
