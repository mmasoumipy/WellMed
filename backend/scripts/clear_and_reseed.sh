#!/bin/bash
# Clear existing data and re-seed

echo "🗑️  Clearing existing course data..."

# Connect to database and clear tables
docker-compose exec db psql -U myuser -d wellmed_db -c "
DELETE FROM course_modules;
DELETE FROM courses;
"

echo "✅ Cleared existing data"
echo "🌱 Starting fresh seeding..."

# Run the seeding script
docker-compose exec backend bash -c 'DATABASE_URL=postgresql://myuser:mypassword@db:5432/wellmed_db bash scripts/seed_courses.sh'

echo "✅ Seeding completed!"