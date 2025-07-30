from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import UserRole

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test users with different roles'

    def handle(self, *args, **options):
        # Create admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            UserRole.objects.create(user=admin_user, role='admin')
            self.stdout.write(
                self.style.SUCCESS(f'Created admin user: {admin_user.username}')
            )

        # Create moderator user
        moderator_user, created = User.objects.get_or_create(
            username='moderator',
            defaults={
                'email': 'moderator@example.com',
                'first_name': 'Moderator',
                'last_name': 'User'
            }
        )
        if created:
            moderator_user.set_password('moderator123')
            moderator_user.save()
            UserRole.objects.create(user=moderator_user, role='moderator')
            self.stdout.write(
                self.style.SUCCESS(f'Created moderator user: {moderator_user.username}')
            )

        # Create contributor user
        contributor_user, created = User.objects.get_or_create(
            username='contributor',
            defaults={
                'email': 'contributor@example.com',
                'first_name': 'Contributor',
                'last_name': 'User'
            }
        )
        if created:
            contributor_user.set_password('contributor123')
            contributor_user.save()
            UserRole.objects.create(user=contributor_user, role='contributor')
            self.stdout.write(
                self.style.SUCCESS(f'Created contributor user: {contributor_user.username}')
            )

        self.stdout.write(
            self.style.SUCCESS('Test users created successfully!')
        )
        self.stdout.write('Admin: admin/admin123')
        self.stdout.write('Moderator: moderator/moderator123')
        self.stdout.write('Contributor: contributor/contributor123') 