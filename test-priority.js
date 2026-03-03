// Test script to verify priority functionality
const http = require('http');

const makeRequest = (method, path, data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const testPriority = async () => {
  console.log('=== Testing Priority Functionality ===\n');

  // Test 1: Create task with HIGH priority
  console.log('Test 1: Creating task with HIGH priority...');
  const createData = {
    title: 'Priority Test Task',
    description: 'Testing priority functionality',
    date: '2024-12-01',
    priority: 'high',
    isImportant: false,
    isCompleted: false,
  };

  try {
    const createResult = await makeRequest('POST', '/api/tasks', createData);
    console.log('Create Response:', JSON.stringify(createResult.data, null, 2));
    
    if (createResult.data.success && createResult.data.data.priority === 'high') {
      console.log('✅ PASS: Task created with HIGH priority\n');
    } else {
      console.log('❌ FAIL: Priority not set correctly on create\n');
    }

    const taskId = createResult.data.data.id;

    // Test 2: Update task to LOW priority
    console.log('Test 2: Updating task to LOW priority...');
    const updateData = {
      id: taskId,
      priority: 'low',
    };

    const updateResult = await makeRequest('PUT', '/api/tasks', updateData);
    console.log('Update Response:', JSON.stringify(updateResult.data, null, 2));
    
    if (updateResult.data.success && updateResult.data.data.priority === 'low') {
      console.log('✅ PASS: Task updated to LOW priority\n');
    } else {
      console.log('❌ FAIL: Priority not updated correctly\n');
    }

    // Test 3: Get tasks and verify priority
    console.log('Test 3: Getting tasks to verify priority...');
    const getResult = await makeRequest('GET', '/api/tasks');
    
    if (getResult.data.success && getResult.data.data.tasks) {
      const testTask = getResult.data.data.tasks.find(t => t.id === taskId);
      if (testTask && testTask.priority === 'low') {
        console.log('✅ PASS: Retrieved task has correct LOW priority');
        console.log('Task:', JSON.stringify(testTask, null, 2), '\n');
      } else {
        console.log('❌ FAIL: Retrieved task has incorrect priority');
        console.log('Task found:', testTask, '\n');
      }
    }

    // Test 4: Update to MEDIUM priority
    console.log('Test 4: Updating task to MEDIUM priority...');
    const updateMediumData = {
      id: taskId,
      priority: 'medium',
    };

    const updateMediumResult = await makeRequest('PUT', '/api/tasks', updateMediumData);
    console.log('Update Response:', JSON.stringify(updateMediumResult.data, null, 2));
    
    if (updateMediumResult.data.success && updateMediumResult.data.data.priority === 'medium') {
      console.log('✅ PASS: Task updated to MEDIUM priority\n');
    } else {
      console.log('❌ FAIL: Priority not updated to medium correctly\n');
    }

    console.log('=== All Priority Tests Complete ===');

  } catch (error) {
    console.error('Test Error:', error.message);
    console.log('\nNote: Make sure the server is running on localhost:3000');
  }
};

// Run tests
testPriority();
