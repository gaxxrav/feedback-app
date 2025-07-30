from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from feedback.models import Board, Tag, Feedback

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test boards and feedback for development'

    def handle(self, *args, **options):
        # Get or create a user for creating boards
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        if created:
            user.set_password('testpass123')
            user.save()

        # Create some tags
        tags = []
        tag_names = ['Bug', 'Feature', 'Improvement', 'UI/UX', 'Performance']
        for tag_name in tag_names:
            tag, created = Tag.objects.get_or_create(name=tag_name)
            tags.append(tag)

        # Create public boards
        public_boards = [
            {
                'name': 'General Feedback',
                'description': 'Share your general feedback and suggestions for our platform.',
                'is_public': True
            },
            {
                'name': 'Feature Requests',
                'description': 'Request new features and improvements for the application.',
                'is_public': True
            },
            {
                'name': 'Bug Reports',
                'description': 'Report bugs and issues you encounter while using the platform.',
                'is_public': True
            }
        ]

        for board_data in public_boards:
            board, created = Board.objects.get_or_create(
                name=board_data['name'],
                defaults={
                    'description': board_data['description'],
                    'is_public': board_data['is_public']
                }
            )
            if created:
                board.members.add(user)
                self.stdout.write(
                    self.style.SUCCESS(f'Created public board: {board.name}')
                )

        # Create a private board
        private_board, created = Board.objects.get_or_create(
            name='Internal Team',
            defaults={
                'description': 'Private board for internal team discussions.',
                'is_public': False
            }
        )
        if created:
            private_board.members.add(user)
            self.stdout.write(
                self.style.SUCCESS(f'Created private board: {private_board.name}')
            )

        # Create some sample feedback
        sample_feedback = [
            {
                'board': public_boards[0]['name'],
                'title': 'Great platform!',
                'description': 'I really like the new interface design. It\'s much more intuitive than before.',
                'status': 'open'
            },
            {
                'board': public_boards[1]['name'],
                'title': 'Dark mode support',
                'description': 'It would be great to have a dark mode option for better visibility in low light.',
                'status': 'open'
            },
            {
                'board': public_boards[2]['name'],
                'title': 'Login page loading slowly',
                'description': 'The login page takes too long to load on mobile devices.',
                'status': 'in_progress'
            }
        ]

        for feedback_data in sample_feedback:
            board = Board.objects.get(name=feedback_data['board'])
            feedback, created = Feedback.objects.get_or_create(
                title=feedback_data['title'],
                board=board,
                defaults={
                    'description': feedback_data['description'],
                    'status': feedback_data['status'],
                    'created_by': user
                }
            )
            if created:
                # Add some random tags
                import random
                feedback.tags.add(random.choice(tags))
                self.stdout.write(
                    self.style.SUCCESS(f'Created feedback: {feedback.title}')
                )

        self.stdout.write(
            self.style.SUCCESS('Test data created successfully!')
        ) 