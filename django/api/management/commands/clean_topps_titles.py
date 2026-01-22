import re
from django.core.management.base import BaseCommand
from api.models import ToppsCard


class Command(BaseCommand):
    help = 'Clean up titles in existing ToppsCard records'

    def handle(self, *args, **options):
        cards = ToppsCard.objects.all()
        total = cards.count()
        updated = 0

        self.stdout.write(f"Processing {total} cards...")

        for card in cards:
            original_title = card.title
            cleaned_title = self.clean_title(original_title)

            if original_title != cleaned_title:
                card.title = cleaned_title
                card.save(update_fields=['title'])
                updated += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Card {card.card_number}: '{original_title[:50]}...' -> '{cleaned_title[:50]}...'"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Completed! Updated {updated} of {total} cards."
            )
        )

    def clean_title(self, title):
        """
        タイトルから不要な文字列を除去
        """
        # まず改行とその後のテキストを削除
        title = title.split('\n')[0].strip()

        # "LOOK FOR AUTO-RELICS", "LOOK FOR RELICS", "look for autos" などの文字列を削除
        cleanup_patterns = [
            r'\s*-\s*LOOK FOR AUTO-RELICS\s*',
            r'\s*-\s*LOOK FOR RELICS\s*',
            r'\s*-\s*LOOK FOR AUTOS\s*',
            r'\s*-\s*look for auto-relics\s*',
            r'\s*-\s*look for relics\s*',
            r'\s*-\s*look for autos\s*',
        ]
        for pattern in cleanup_patterns:
            title = re.sub(pattern, '', title, flags=re.IGNORECASE)

        # 連続するハイフンやスペースを整理
        title = re.sub(r'\s*-\s*-\s*', ' - ', title)
        title = re.sub(r'\s+', ' ', title).strip()

        # 末尾のハイフンを削除
        title = title.rstrip(' -').strip()

        return title
