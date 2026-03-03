const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Count tasks
    const taskCount = await prisma.task.count();
    console.log('✅ Task table exists. Count:', taskCount);
    
    // Test 2: Count boards
    const boardCount = await prisma.board.count();
    console.log('✅ Board table exists. Count:', boardCount);
    
    // Test 3: Create a test task
    const task = await prisma.task.create({
      data: {
        title: 'Test Task',
        description: 'Test description',
        date: '2026-02-26',
        priority: 'high',
        isCompleted: false,
        isImportant: true,
        userId: 'test_user_123'
      }
    });
    console.log('✅ Task created successfully:', task.id);
    
    // Test 4: Verify task has priority
    const foundTask = await prisma.task.findUnique({
      where: { id: task.id }
    });
    console.log('✅ Task priority:', foundTask.priority);
    
    // Cleanup
    await prisma.task.delete({ where: { id: task.id } });
    console.log('✅ Test task cleaned up');
    
    console.log('\n🎉 All database tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
