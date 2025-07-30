from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import UserRole

User = get_user_model()

class Command(BaseCommand):
    help = 'Set up default user roles'

    def handle(self, *args, **options):
        # Create roles for existing users
        for user in User.objects.all():
            UserRole.objects.get_or_create(
                user=user,
                defaults={'role': 'contributor'}
            )
        
        # Make the first user an admin
        if User.objects.exists():
            first_user = User.objects.first()
            user_role, created = UserRole.objects.get_or_create(user=first_user)
            user_role.role = 'admin'
            user_role.save()
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully set up roles. {first_user.username} is now admin.')
            )
