from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()

class Command(BaseCommand):
    help = 'Set up test roles and users for role-based access testing'

    def handle(self, *args, **options):
        # Create test users
        users_data = [
            {
                'username': 'admin_user',
                'email': 'admin@example.com',
                'first_name': 'Admin',
                'last_name': 'User'
            },
            {
                'username': 'moderator_user',
                'email': 'moderator@example.com',
                'first_name': 'Moderator',
                'last_name': 'User'
            },
            {
                'username': 'regular_user',
                'email': 'user@example.com',
                'first_name': 'Regular',
                'last_name': 'User'
            },
            {
                'username': 'test_user',
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User'
            }
        ]

        created_users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults=user_data
            )
            if created:
                user.set_password('testpass123')
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Created user: {user.username}')
                )
            created_users.append(user)

        # Create roles/groups
        roles_data = [
            {
                'name': 'Administrators',
                'description': 'Full access to all boards'
            },
            {
                'name': 'Moderators',
                'description': 'Can moderate feedback and manage boards'
            },
            {
                'name': 'Contributors',
                'description': 'Can create feedback and view assigned boards'
            },
            {
                'name': 'Viewers',
                'description': 'Can only view public boards'
            }
        ]

        created_groups = []
        for role_data in roles_data:
            group, created = Group.objects.get_or_create(
                name=role_data['name']
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created role: {group.name}')
                )
            created_groups.append(group)

        # Assign users to roles
        # Admin user gets all roles
        admin_user = User.objects.get(username='admin_user')
        for group in created_groups:
            admin_user.groups.add(group)

        # Moderator user gets moderator and contributor roles
        moderator_user = User.objects.get(username='moderator_user')
        moderator_group = Group.objects.get(name='Moderators')
        contributor_group = Group.objects.get(name='Contributors')
        moderator_user.groups.add(moderator_group, contributor_group)

        # Regular user gets contributor role
        regular_user = User.objects.get(username='regular_user')
        regular_user.groups.add(contributor_group)

        # Test user gets viewer role
        test_user = User.objects.get(username='test_user')
        viewer_group = Group.objects.get(name='Viewers')
        test_user.groups.add(viewer_group)

        self.stdout.write(
            self.style.SUCCESS('Successfully set up test roles and users!')
        )
        self.stdout.write('Test users:')
        self.stdout.write('- admin_user / testpass123 (all roles)')
        self.stdout.write('- moderator_user / testpass123 (moderator + contributor)')
        self.stdout.write('- regular_user / testpass123 (contributor)')
        self.stdout.write('- test_user / testpass123 (viewer)') 