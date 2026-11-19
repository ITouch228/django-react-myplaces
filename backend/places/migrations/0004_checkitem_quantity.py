from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("places", "0003_place_catalog_fields")]

    operations = [
        migrations.AddField(
            model_name="checkitem",
            name="quantity",
            field=models.PositiveIntegerField(default=1),
        ),
    ]
