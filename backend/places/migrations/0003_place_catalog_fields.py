from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("places", "0002_check_checkitem_delete_entry")]

    operations = [
        migrations.AddField(
            model_name="place",
            name="category",
            field=models.CharField(
                choices=[
                    ("cafe", "Кафе"),
                    ("restaurant", "Ресторан"),
                    ("bar", "Бар"),
                    ("bakery", "Пекарня"),
                    ("other", "Другое"),
                ],
                default="other",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="place",
            name="visit_status",
            field=models.CharField(
                choices=[("want", "Хочу посетить"), ("visited", "Посещено")],
                default="visited",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="place",
            name="is_favorite",
            field=models.BooleanField(default=False),
        ),
    ]
