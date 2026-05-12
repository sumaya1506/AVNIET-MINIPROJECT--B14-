/**
 * Seed script — run once to bootstrap the database:
 *   cd backend && node utils/seed.js
 *
 * Creates:
 *   • 1 Admin   (admin@placeiq.dev  / Admin@123)
 *   • 2 Recruiters
 *   • 3 Students
 *   • 4 Jobs
 */

require('dotenv').config();
const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const Admin     = require('../models/Admin');
const Recruiter = require('../models/Recruiter');
const Student   = require('../models/Student');
const Job       = require('../models/Job');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placeiqDB';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Wipe existing seed data
  await Promise.all([
    Admin.deleteMany({}),
    Recruiter.deleteMany({}),
    Student.deleteMany({}),
    Job.deleteMany({})
  ]);
  console.log('🗑  Cleared existing data');

  // ── Admin ──────────────────────────────────────────────
  const admin = await Admin.create({
    name:     'Super Admin',
    email:    'admin@placeiq.dev',
    password: 'Admin@123',
    role:     'admin'
  });
  console.log('👤 Admin created:', admin.email);

  // ── Recruiters ─────────────────────────────────────────
  const [rec1, rec2] = await Recruiter.create([
    {
      name:     'Priya Sharma',
      email:    'priya@techcorp.com',
      password: await bcrypt.hash('Recruiter@123', 10),
      role:     'recruiter',
      company:  { name: 'TechCorp Solutions', industry: 'Technology', website: 'https://techcorp.com', location: 'Hyderabad', size: '201-1000' }
    },
    {
      name:     'Rahul Verma',
      email:    'rahul@infosys.com',
      password: await bcrypt.hash('Recruiter@123', 10),
      role:     'recruiter',
      company:  { name: 'Infosys Ltd', industry: 'IT Services', website: 'https://infosys.com', location: 'Bangalore', size: '1000+' }
    }
  ]);
  console.log('🏢 Recruiters created:', rec1.email, rec2.email);

  // ── Students ───────────────────────────────────────────
  const [stu1] = await Student.create([
    {
      name:        'Arjun Reddy',
      email:       'arjun@student.com',
      password:    'Student@123',
      role:        'student',
      college:     'JNTU Hyderabad',
      department:  'CSE',
      year:        'Final Year',
      cgpa:        8.7,
      skills:      ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python'],
      bio:         'Full-stack developer passionate about building scalable web applications.'
    },
    {
      name:        'Sneha Patel',
      email:       'sneha@student.com',
      password:    'Student@123',
      role:        'student',
      college:     'BITS Pilani',
      department:  'ECE',
      year:        'Final Year',
      cgpa:        9.1,
      skills:      ['Embedded C', 'Python', 'MATLAB', 'IoT', 'Machine Learning'],
      bio:         'Electronics engineer with a passion for IoT and smart systems.'
    },
    {
      name:        'Vikram Kumar',
      email:       'vikram@student.com',
      password:    'Student@123',
      role:        'student',
      college:     'IIT Bombay',
      department:  'CSE',
      year:        'Final Year',
      cgpa:        9.4,
      skills:      ['Java', 'Spring Boot', 'AWS', 'Docker', 'Kubernetes'],
      bio:         'Backend engineer with deep interest in distributed systems and cloud.'
    }
  ]);
  console.log('🎓 Students created');

  // ── Jobs ───────────────────────────────────────────────
  await Job.create([
    {
      title:          'Full Stack Developer',
      description:    'Build and maintain modern web applications using React and Node.js. Work in an agile team, participate in code reviews, and collaborate with product designers.',
      skillsRequired: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'REST API'],
      recruiter:      rec1._id,
      company:        { name: rec1.company.name, website: rec1.company.website },
      location:       'Hyderabad',
      type:           'Full-time',
      salary:         { min: 600000, max: 1200000, currency: 'INR' },
      minCGPA:        7.0,
      openings:       5,
      deadline:       new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive:       true,
      tags:           ['web', 'fullstack', 'startup']
    },
    {
      title:          'Backend Engineer – Java',
      description:    'Design and implement microservices using Java Spring Boot. Experience with REST APIs, SQL/NoSQL databases, and cloud platforms is essential.',
      skillsRequired: ['Java', 'Spring Boot', 'MySQL', 'AWS', 'Docker'],
      recruiter:      rec2._id,
      company:        { name: rec2.company.name, website: rec2.company.website },
      location:       'Bangalore',
      type:           'Full-time',
      salary:         { min: 800000, max: 1500000, currency: 'INR' },
      minCGPA:        7.5,
      openings:       10,
      deadline:       new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      isActive:       true
    },
    {
      title:          'ML Engineer Intern',
      description:    'Work on real-world machine learning projects. Assist in data preprocessing, model training, and deployment pipelines.',
      skillsRequired: ['Python', 'TensorFlow', 'Pandas', 'Machine Learning', 'SQL'],
      recruiter:      rec1._id,
      company:        { name: rec1.company.name, website: rec1.company.website },
      location:       'Remote',
      type:           'Internship',
      salary:         { min: 25000, max: 40000, currency: 'INR' },
      minCGPA:        6.5,
      openings:       3,
      deadline:       new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      isActive:       true
    },
    {
      title:          'DevOps Engineer',
      description:    'Manage CI/CD pipelines, containerised deployments, and cloud infrastructure. Work with Kubernetes, Terraform, and monitoring tools.',
      skillsRequired: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform'],
      recruiter:      rec2._id,
      company:        { name: rec2.company.name, website: rec2.company.website },
      location:       'Bangalore',
      type:           'Full-time',
      salary:         { min: 1000000, max: 1800000, currency: 'INR' },
      minCGPA:        7.0,
      openings:       4,
      isActive:       true
    }
  ]);
  console.log('💼 Jobs created');

  console.log('\n✅ Seed complete!\n');
  console.log('─────────────────────────────────────────────');
  console.log('  Admin     → admin@placeiq.dev   / Admin@123');
  console.log('  Recruiter → priya@techcorp.com  / Recruiter@123');
  console.log('  Recruiter → rahul@infosys.com   / Recruiter@123');
  console.log('  Student   → arjun@student.com   / Student@123');
  console.log('  Student   → sneha@student.com   / Student@123');
  console.log('  Student   → vikram@student.com  / Student@123');
  console.log('─────────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
