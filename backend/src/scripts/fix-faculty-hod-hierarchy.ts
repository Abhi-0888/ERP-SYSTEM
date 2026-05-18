/**
 * Migration: Link faculty to their department HOD
 * Ensures faculty users have correct departmentId so HOD can see them
 */
import mongoose from 'mongoose';

async function run() {
    await mongoose.connect('mongodb://localhost:27017/university-erp');
    console.log('Connected to DB');

    const db = mongoose.connection.db!;
    const users = db.collection('users');
    const departments = db.collection('departments');

    // 1. Get all departments with HOD assignments
    const allDepts = await departments.find({}).toArray();
    console.log(`Found ${allDepts.length} departments`);

    for (const dept of allDepts) {
        console.log(`\nDept: ${dept.name} (${dept.code})`);

        // Get HOD for this dept
        const hod = dept.hodId
            ? await users.findOne({ _id: dept.hodId })
            : null;
        if (hod) {
            console.log(`  HOD: ${hod.name} (${hod.username})`);
            // Ensure HOD has correct departmentId
            await users.updateOne(
                { _id: hod._id },
                { $set: { departmentId: dept._id } }
            );
        }

        // 2. Find all faculty in this department (by role=FACULTY or HOD and existing departmentId)
        const facultyInDept = await users.find({
            role: 'FACULTY',
            departmentId: dept._id,
        }).toArray();

        console.log(`  Faculty: ${facultyInDept.map(f => f.username).join(', ')}`);

        // Ensure all faculty in this dept have the correct departmentId (already set, but confirm)
        for (const f of facultyInDept) {
            await users.updateOne(
                { _id: f._id },
                { $set: { departmentId: dept._id, universityId: dept.universityId } }
            );
        }

        // Also update any faculty that have this dept's code in their username pattern
        // Use exact segment match: faculty_cse1 matches CSE, not CE
        const deptCode = dept.code?.toLowerCase();
        if (deptCode) {
            const patternFaculty = await users.find({
                role: 'FACULTY',
                username: { $regex: `_${deptCode}\\d`, $options: 'i' }
            }).toArray();

            for (const f of patternFaculty) {
                await users.updateOne(
                    { _id: f._id },
                    { $set: { departmentId: dept._id, universityId: dept.universityId } }
                );
                console.log(`  Linked ${f.username} → dept ${dept.code}`);
            }
        }
    }

    // 3. Print summary
    console.log('\n=== FINAL FACULTY ASSIGNMENTS ===');
    const allFaculty = await users.find({ role: { $in: ['FACULTY', 'HOD'] } }).toArray();
    for (const f of allFaculty) {
        const dept = f.departmentId
            ? await departments.findOne({ _id: f.departmentId })
            : null;
        console.log(`  ${f.role.padEnd(7)} ${f.username.padEnd(15)} → Dept: ${dept?.code || 'NONE'}`);
    }

    await mongoose.disconnect();
    console.log('\nDone!');
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
