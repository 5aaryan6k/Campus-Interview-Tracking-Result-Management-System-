const http = require('http');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('./config/db');

dotenv.config();

// We will start the server on Port 5001 for test isolation
process.env.PORT = '5001';
process.env.NODE_ENV = 'test';

const startServer = () => {
  return new Promise((resolve) => {
    const app = expressSetup();
    const server = http.createServer(app);
    server.listen(5001, () => {
      console.log('Test server started on port 5001');
      resolve(server);
    });
  });
};

// Recreate server loader locally to avoid requiring require('./server') which boots instantly
function expressSetup() {
  const express = require('express');
  const cors = require('cors');
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/students', require('./routes/students'));
  app.use('/api/companies', require('./routes/companies'));
  app.use('/api/rounds', require('./routes/rounds'));
  app.use('/api/dashboard', require('./routes/dashboard'));

  return app;
}

// Helper fetch client for HTTP calls against test server
const apiCall = async (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            raw: data,
          });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  let server;
  try {
    console.log('Connecting to database...');
    await connectDB();
    server = await startServer();

    let authToken = null;
    let studentCSE1_Id = null;
    let studentECE_Id = null;
    let studentCSE2_Id = null;
    let companyId = null;
    let rounds = [];

    // --- TEST 1: Register Officer ---
    console.log('\n--- Test 1: Registering Officer ---');
    const registerRes = await apiCall('POST', '/api/auth/register', {
      name: 'Admin Placement Officer',
      email: 'officer@campus.edu',
      password: 'password123',
    });
    console.log('Status:', registerRes.status, 'User:', registerRes.data.data?.name);
    if (registerRes.status !== 201) throw new Error('Auth Registration Failed');
    authToken = registerRes.data.data.token;

    // --- TEST 2: Login Officer ---
    console.log('\n--- Test 2: Logging in Officer ---');
    const loginRes = await apiCall('POST', '/api/auth/login', {
      email: 'officer@campus.edu',
      password: 'password123',
    });
    console.log('Status:', loginRes.status, 'Token exists:', !!loginRes.data.data?.token);
    if (loginRes.status !== 200) throw new Error('Auth Login Failed');

    // --- TEST 3: Create Students ---
    console.log('\n--- Test 3: Creating Students ---');
    const s1 = await apiCall('POST', '/api/students', {
      rollNumber: 'CSE-001',
      name: 'John Doe',
      email: 'john@gmail.com',
      department: 'CSE',
      cgpa: 9.2,
    }, authToken);
    console.log('Student 1 Created:', s1.data.success);
    studentCSE1_Id = s1.data.data._id;

    const s2 = await apiCall('POST', '/api/students', {
      rollNumber: 'ECE-002',
      name: 'Alice Smith',
      email: 'alice@gmail.com',
      department: 'ECE',
      cgpa: 8.5,
    }, authToken);
    console.log('Student 2 Created:', s2.data.success);
    studentECE_Id = s2.data.data._id;

    const s3 = await apiCall('POST', '/api/students', {
      rollNumber: 'CSE-003',
      name: 'Bob PoorCGPA',
      email: 'bob@gmail.com',
      department: 'CSE',
      cgpa: 5.5,
    }, authToken);
    console.log('Student 3 Created:', s3.data.success);
    studentCSE2_Id = s3.data.data._id;

    // --- TEST 4: Create Company with rounds ---
    console.log('\n--- Test 4: Creating Company & Workflow Rounds ---');
    const c1 = await apiCall('POST', '/api/companies', {
      name: 'Tech Giant Corp',
      jobRole: 'Software Engineer',
      packageLPA: 12.5,
      minCGPA: 7.0,
      eligibleDepartments: ['CSE', 'ECE'],
      rounds: [
        { roundName: 'Aptitude Test', sequenceOrder: 1, roundType: 'Aptitude' },
        { roundName: 'Technical Interview', sequenceOrder: 2, roundType: 'Technical' },
        { roundName: 'HR Final Round', sequenceOrder: 3, roundType: 'HR' },
      ],
    }, authToken);
    console.log('Company Created:', c1.data.data.company.name, 'Rounds Count:', c1.data.data.rounds.length);
    if (c1.data.data.rounds.length !== 3) throw new Error('Rounds failed to initialize');
    companyId = c1.data.data.company._id;
    rounds = c1.data.data.rounds;

    // --- TEST 5: Verify Eligibility for Round 1 ---
    console.log('\n--- Test 5: Fetching Round 1 Eligibility ---');
    const r1Candidates = await apiCall('GET', `/api/rounds/${rounds[0]._id}/candidates`, null, authToken);
    console.log('Eligible count:', r1Candidates.data.data.eligible.length);
    
    const eligibleRollNumbers = r1Candidates.data.data.eligible.map(s => s.rollNumber);
    console.log('Eligible Roll Numbers:', eligibleRollNumbers);
    
    // Assert Bob (CSE-003) is excluded due to low CGPA
    if (eligibleRollNumbers.includes('CSE-003')) {
      throw new Error('Business Rule Failure: Underqualified CGPA candidate is eligible');
    }
    if (!eligibleRollNumbers.includes('CSE-001') || !eligibleRollNumbers.includes('ECE-002')) {
      throw new Error('Business Rule Failure: Qualified candidates not marked eligible');
    }

    // --- TEST 6: Register Candidates for Round 1 ---
    console.log('\n--- Test 6: Registering Candidates in Round 1 ---');
    const regRes = await apiCall('POST', `/api/rounds/${rounds[0]._id}/candidates/register`, {
      studentIds: [studentCSE1_Id, studentECE_Id],
    }, authToken);
    console.log('Registration message:', regRes.data.message);

    // Verify candidates are now registered
    const r1CandidatesVerify = await apiCall('GET', `/api/rounds/${rounds[0]._id}/candidates`, null, authToken);
    console.log('Registered candidates count:', r1CandidatesVerify.data.data.registered.length);
    if (r1CandidatesVerify.data.data.registered.length !== 2) {
      throw new Error('Registration verification failed');
    }

    // --- TEST 7: Record Attendance for Round 1 ---
    console.log('\n--- Test 7: Recording Attendance for Round 1 ---');
    const attRes = await apiCall('POST', `/api/rounds/${rounds[0]._id}/attendance`, {
      attendanceData: [
        { studentId: studentCSE1_Id, attendance: 'Present' },
        { studentId: studentECE_Id, attendance: 'Present' },
      ],
    }, authToken);
    console.log('Attendance message:', attRes.data.message);

    // --- TEST 8: Record Results for Round 1 ---
    console.log('\n--- Test 8: Recording Results for Round 1 ---');
    const resRes = await apiCall('POST', `/api/rounds/${rounds[0]._id}/results`, {
      resultData: [
        { studentId: studentCSE1_Id, result: 'Cleared', remarks: 'Good logic' },
        { studentId: studentECE_Id, result: 'Rejected', remarks: 'Aptitude weak' },
      ],
    }, authToken);
    console.log('Result recording message:', resRes.data.message);

    // --- TEST 9: Verify Round 2 Eligibility ---
    console.log('\n--- Test 9: Checking Round 2 Eligibility (Only Cleared student) ---');
    const r2Candidates = await apiCall('GET', `/api/rounds/${rounds[1]._id}/candidates`, null, authToken);
    const r2EligibleIds = r2Candidates.data.data.eligible.map(s => s._id.toString());
    console.log('Round 2 Eligible Candidates Count:', r2EligibleIds.length);
    
    if (r2EligibleIds.includes(studentECE_Id)) {
      throw new Error('Business Rule Failure: Rejected candidate from Round 1 allowed in Round 2');
    }
    if (!r2EligibleIds.includes(studentCSE1_Id)) {
      throw new Error('Business Rule Failure: Cleared candidate from Round 1 excluded from Round 2');
    }

    // --- TEST 10: Register CSE Student in Round 2 ---
    await apiCall('POST', `/api/rounds/${rounds[1]._id}/candidates/register`, {
      studentIds: [studentCSE1_Id],
    }, authToken);
    
    // Set Present & Clear in Round 2
    await apiCall('POST', `/api/rounds/${rounds[1]._id}/attendance`, {
      attendanceData: [{ studentId: studentCSE1_Id, attendance: 'Present' }],
    }, authToken);
    
    await apiCall('POST', `/api/rounds/${rounds[1]._id}/results`, {
      resultData: [{ studentId: studentCSE1_Id, result: 'Cleared', remarks: 'Great coder' }],
    }, authToken);

    // --- TEST 11: Register and Clear in Final HR Round ---
    console.log('\n--- Test 11: Final Round (HR) Pipeline Progression ---');
    await apiCall('POST', `/api/rounds/${rounds[2]._id}/candidates/register`, {
      studentIds: [studentCSE1_Id],
    }, authToken);

    await apiCall('POST', `/api/rounds/${rounds[2]._id}/attendance`, {
      attendanceData: [{ studentId: studentCSE1_Id, attendance: 'Present' }],
    }, authToken);

    const hrRes = await apiCall('POST', `/api/rounds/${rounds[2]._id}/results`, {
      resultData: [{ studentId: studentCSE1_Id, result: 'Cleared', remarks: 'Hired' }],
    }, authToken);
    console.log('HR Round Result Message:', hrRes.data.message);

    // --- TEST 12: Verify Placed Outcomes ---
    console.log('\n--- Test 12: Verifying Placed Status & Package ---');
    const studentRes = await apiCall('GET', `/api/students/${studentCSE1_Id}`, null, authToken);
    const studentData = studentRes.data.data.student;
    console.log('Student Status:', studentData.status);
    console.log('Placed Company Name:', studentData.placedCompanyId.name);
    console.log('Package LPA:', studentData.packageLPA);

    if (studentData.status !== 'Placed') {
      throw new Error('Business Rule Failure: Student not marked Placed after final round clearance');
    }
    if (studentData.placedCompanyId._id !== companyId) {
      throw new Error('Business Rule Failure: Placed company association incorrect');
    }
    if (studentData.packageLPA !== 12.5) {
      throw new Error('Business Rule Failure: Compensation package incorrect');
    }

    // --- TEST 13: Fetch Dashboard Stats ---
    console.log('\n--- Test 13: Dashboard Metrics Verification ---');
    const dashRes = await apiCall('GET', '/api/dashboard/stats', null, authToken);
    const dash = dashRes.data.data;
    console.log('Total students in dashboard:', dash.summary.totalStudents);
    console.log('Placed count in dashboard:', dash.summary.placedStudents);
    console.log('Placement rate in dashboard:', dash.summary.placementRate);
    console.log('Average Package in dashboard:', dash.summary.avgPackage);

    if (dash.summary.totalStudents !== 3) throw new Error('Dashboard stats: total count mismatch');
    if (dash.summary.placedStudents !== 1) throw new Error('Dashboard stats: placed count mismatch');
    if (dash.summary.placementRate !== 33.3) throw new Error('Dashboard stats: placement rate mismatch');
    if (dash.summary.avgPackage !== 12.5) throw new Error('Dashboard stats: avg package mismatch');

    console.log('\n>>> ALL API VERIFICATION TESTS PASSED SUCCESSFULLY! <<<');
  } catch (error) {
    console.error('\n!!! TEST RUN ENCOUNTERED AN ERROR !!!');
    console.error(error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
      console.log('Test server stopped.');
    }
    await disconnectDB();
    process.exit(0);
  }
}

runTests();
