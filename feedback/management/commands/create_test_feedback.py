from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from feedback.models import Board, Tag, Feedback
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test feedback data for testing'

    def handle(self, *args, **options):
        # Get or create test users
        admin_user, _ = User.objects.get_or_create(
            username='admin_user',
            defaults={
                'email': 'admin@example.com',
                'first_name': 'Admin',
                'last_name': 'User'
            }
        )
        
        regular_user, _ = User.objects.get_or_create(
            username='regular_user',
            defaults={
                'email': 'user@example.com',
                'first_name': 'Regular',
                'last_name': 'User'
            }
        )

        # Get or create test boards
        board1, _ = Board.objects.get_or_create(
            name='Product Feedback',
            defaults={
                'description': 'General product feedback and suggestions',
                'is_public': True,
                'created_by': admin_user
            }
        )
        
        board2, _ = Board.objects.get_or_create(
            name='Bug Reports',
            defaults={
                'description': 'Report bugs and issues',
                'is_public': True,
                'created_by': admin_user
            }
        )

        # Get or create test tags
        tags_data = [
            {'name': 'Bug'},
            {'name': 'Feature'},
            {'name': 'Enhancement'},
            {'name': 'UI/UX'},
            {'name': 'Performance'},
        ]
        
        tags = {}
        for tag_data in tags_data:
            tag, _ = Tag.objects.get_or_create(name=tag_data['name'])
            tags[tag.name] = tag

        # Create test feedback
        feedback_data = [
            {
                'title': 'Add dark mode support',
                'description': 'Users have been requesting dark mode for better user experience, especially for late-night usage.',
                'status': 'open',
                'board': board1,
                'created_by': regular_user,
                'tags': [tags['Feature'], tags['UI/UX']]
            },
            {
                'title': 'Fix login page loading issue',
                'description': 'The login page sometimes takes too long to load, especially on slower connections.',
                'status': 'in_progress',
                'board': board2,
                'created_by': admin_user,
                'tags': [tags['Bug'], tags['Performance']]
            },
            {
                'title': 'Improve search functionality',
                'description': 'The current search could be more intuitive and faster. Consider adding filters and autocomplete.',
                'status': 'open',
                'board': board1,
                'created_by': regular_user,
                'tags': [tags['Enhancement'], tags['UI/UX']]
            },
            {
                'title': 'Add export feature',
                'description': 'Users need to export their data in various formats (PDF, CSV, Excel).',
                'status': 'completed',
                'board': board1,
                'created_by': admin_user,
                'tags': [tags['Feature']]
            },
            {
                'title': 'Mobile app crashes on startup',
                'description': 'The mobile app crashes immediately after launch on Android devices.',
                'status': 'open',
                'board': board2,
                'created_by': regular_user,
                'tags': [tags['Bug']]
            }
        ]

        created_count = 0
        for feedback_info in feedback_data:
            feedback, created = Feedback.objects.get_or_create(
                title=feedback_info['title'],
                board=feedback_info['board'],
                defaults={
                    'description': feedback_info['description'],
                    'status': feedback_info['status'],
                    'created_by': feedback_info['created_by']
                }
            )
            
            if created:
                # Add tags
                feedback.tags.set(feedback_info['tags'])
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created feedback: {feedback.title}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} feedback items!')
        )
        
        # Add some upvotes
        feedback1 = Feedback.objects.get(title='Add dark mode support')
        feedback1.upvotes.add(admin_user)
        
        feedback2 = Feedback.objects.get(title='Fix login page loading issue')
        feedback2.upvotes.add(regular_user)
        feedback2.upvotes.add(admin_user)
        
        self.stdout.write(
            self.style.SUCCESS('Added some test upvotes to feedback items!')
        ) 