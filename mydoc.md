MY DOCUMENTATION ON HOW TO BUILD THIS PROJECT - Gaurav Murali

>> Backend: django + django rest framework

>> Frontend: React (Frontend UI) 

>> Integration: Axios for API calls (Handle requests from React to Django) so that Django and React can communicate with each other over HTTP using JSON APIs

>> DB: sqlite3

* API building checklist:
    1. Model the board in Django (with details such as) at feedback/models.py
        > name
        > description
        > is_public
        > owner
        > created_at

    2. Create a serializer - to convert Django models into JSON and vice versa
        > DRF uses this to send data to frontend and validate input from frontend
        > It is like a translator between python and JSON

    3. Create API views - the actual API logic for CRUD operations
        > viewsets.ModelViewSet gives GET (list all boards), POST (create a new board), PUT/PATCH/DELETE (edit and delete)
        > permission_classes - only logged in users can access this
        > perform_create - when user creates board, set owner as the currently logged in user
        > get_queryset - show only public boards or those that the owner has access to
    
    4. Connect to URLs - urls.py (MAKE SURE TO INCLUDE IN YOUR main_urls.py):
        > registers your API endpoints for GET, POST, etc
        > router auto generates the endpoints based on BoardViewSet
        > Makes API accessible to the "outside world"
    
    5. Enable CORS (cross origin resource sharing) - settings.py
        > Allows frontend (react) running on different port to call backend (django)
        > frontend and backend can talk to each other
        > without this browser would block requests due to security rules
    
    6. Now we can setup frontend (React + axios) - frontend/src/utils/api.js
        > connection layer from frontend to backend


ROOT LEVEL:

feedback/
├── manage.py                 # Django's command-line utility
├── db.sqlite3               # SQLite database file
├── venv/                    # Python virtual environment
├── mydoc.md                 # Your project documentation
└── todo.md                  # Project tasks


BACKEND DJANGO:

├── backend/                 # Django project settings
│   ├── settings.py         # Main Django configuration
│   ├── urls.py            # Main URL routing
│   └── wsgi.py            # Web server gateway
├── authentication/          # User authentication app
├── core/                   # Core functionality app
└── feedback/              # Main feedback app

REACT FRONTEND:

├── frontend/               # React application
│   ├── public/            # Static files
│   └── src/               # React source code
│       ├── components/    # React components
│       ├── context/       # React context (AuthContext)
│       ├── pages/         # Page components
│       └── utils/         # Utility functions (API)