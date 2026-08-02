document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('gradingForm');
    const btnReset = document.getElementById('btnReset');
    const errorMessage = document.getElementById('errorMessage');
    
    const resultsSection = document.getElementById('resultsSection');
    const resultsTableBody = document.getElementById('resultsTableBody');
    
    const reportCardSection = document.getElementById('reportCardSection');
    const reportStudentName = document.getElementById('reportStudentName');
    const reportRollNo = document.getElementById('reportRollNo');
    const reportTableBody = document.getElementById('reportTableBody');
    const headerStatusBadge = document.getElementById('headerStatusBadge');
    const reportSummaryCards = document.getElementById('reportSummaryCards');

    const subjectList = [
        { id: 'english', name: 'English', maxMarks: 100 },
        { id: 'maths', name: 'Mathematics', maxMarks: 100 },
        { id: 'cs', name: 'Computer Science (CS)', maxMarks: 200 },
        { id: 'physics', name: 'Physics', maxMarks: 100 },
        { id: 'chemistry', name: 'Chemistry', maxMarks: 100 }
    ];

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        hideError();

        const studentName = document.getElementById('studentName').value.trim();
        const rollNo = document.getElementById('rollNo').value.trim();

        // IF / ELSE: Form validation for mandatory text inputs
        if (!studentName || !rollNo) {
            showError('Please provide both Student Name and Roll Number.');
            return;
        }

        const marksData = [];
        let totalMarks = 0;
        let totalMaxPossibleMarks = 0;
        let hasValidationError = false;

        // FOR Loop: Iterate over subject inputs for numeric & range validation
        for (let i = 0; i < subjectList.length; i++) {
            const subject = subjectList[i];
            const inputVal = document.getElementById(subject.id).value.trim();
            const mark = parseFloat(inputVal);

            // IF / ELSE: Check missing or out-of-bounds numeric marks
            if (inputVal === '' || isNaN(mark)) {
                showError(`Please enter a valid numeric mark for ${subject.name}.`);
                hasValidationError = true;
                break;
            } else if (mark < 0 || mark > subject.maxMarks) {
                showError(`Marks for ${subject.name} must be between 0 and ${subject.maxMarks}.`);
                hasValidationError = true;
                break;
            }

            totalMarks += mark;
            totalMaxPossibleMarks += subject.maxMarks;
            
            // Pass criteria: minimum 40% of subject maxMarks (40/100 or 80/200)
            const passThreshold = 0.40 * subject.maxMarks;

            marksData.push({
                name: subject.name,
                marks: mark,
                maxMarks: subject.maxMarks,
                percentage: (mark / subject.maxMarks) * 100,
                passed: mark >= passThreshold
            });
        }

        if (hasValidationError) return;

        const overallPercentage = (totalMarks / totalMaxPossibleMarks) * 100;

        // SWITCH: Categorize percentage into Letter Grade
        let grade = '';
        switch (true) {
            case (overallPercentage >= 90):
                grade = 'A+';
                break;
            case (overallPercentage >= 80):
                grade = 'A';
                break;
            case (overallPercentage >= 70):
                grade = 'B+';
                break;
            case (overallPercentage >= 60):
                grade = 'B';
                break;
            case (overallPercentage >= 50):
                grade = 'C';
                break;
            default:
                grade = 'F';
                break;
        }

        // WHILE Loop: Count subjects with high distinction score (≥ 75% score ratio)
        let distinctionCount = 0;
        let index = 0;
        while (index < marksData.length) {
            if (marksData[index].percentage >= 75) {
                distinctionCount++;
            }
            index++;
        }

        // IF / ELSE: Evaluate overall pass/fail condition
        let failCount = 0;
        for (let j = 0; j < marksData.length; j++) {
            if (!marksData[j].passed) failCount++;
        }

        const overallPassed = (overallPercentage >= 40 && failCount === 0);
        const statusText = overallPassed ? 'PASS' : 'FAIL';
        const statusBadgeClass = overallPassed ? 'badge-pass' : 'badge-fail';

        // Update Results Summary Table
        resultsTableBody.innerHTML = `
            <tr>
                <td>1</td>
                <td><strong>${escapeHTML(studentName)}</strong></td>
                <td>${escapeHTML(rollNo)}</td>
                <td><strong>${totalMarks} / ${totalMaxPossibleMarks}</strong></td>
                <td><strong>${overallPercentage.toFixed(2)}%</strong></td>
                <td><span class="badge-grade">${grade}</span></td>
                <td><span class="badge-status ${statusBadgeClass}">${statusText}</span></td>
            </tr>
        `;
        resultsSection.classList.remove('hidden');

        // Update Detailed Report Card Header
        reportStudentName.textContent = studentName;
        reportRollNo.textContent = `Roll No: ${rollNo}`;
        headerStatusBadge.innerHTML = `<span class="badge-status ${statusBadgeClass}">${statusText}</span>`;

        // Update Detailed Subject Rows with Progress Bar
        let reportRowsHTML = '';
        for (let k = 0; k < marksData.length; k++) {
            const sub = marksData[k];
            const subStatusText = sub.passed ? 'Pass' : 'Fail';
            const subStatusClass = sub.passed ? 'badge-pass' : 'badge-fail';
            const fillClass = sub.passed ? '' : 'fill-fail';

            reportRowsHTML += `
                <tr>
                    <td><strong>${sub.name}</strong></td>
                    <td><strong>${sub.marks}</strong> / ${sub.maxMarks}</td>
                    <td>
                        <div class="score-progress-bar">
                            <div class="score-progress-fill ${fillClass}" style="width: ${sub.percentage.toFixed(1)}%;"></div>
                        </div>
                    </td>
                    <td><span class="badge-status ${subStatusClass}">${subStatusText}</span></td>
                </tr>
            `;
        }
        reportTableBody.innerHTML = reportRowsHTML;

        // Render Performance Indicator Metric Tiles
        reportSummaryCards.innerHTML = `
            <div class="metric-tile">
                <span class="metric-label">Total Score</span>
                <span class="metric-value">${totalMarks} / ${totalMaxPossibleMarks}</span>
            </div>
            <div class="metric-tile">
                <span class="metric-label">Percentage</span>
                <span class="metric-value">${overallPercentage.toFixed(2)}%</span>
            </div>
            <div class="metric-tile">
                <span class="metric-label">Final Grade</span>
                <span class="metric-value"><span class="badge-grade">${grade}</span></span>
            </div>
            <div class="metric-tile">
                <span class="metric-label">Distinctions (≥75%)</span>
                <span class="metric-value">${distinctionCount} / 5</span>
            </div>
        `;
        reportCardSection.classList.remove('hidden');

        // Smooth scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    });

    btnReset.addEventListener('click', () => {
        form.reset();
        hideError();
        resultsSection.classList.add('hidden');
        reportCardSection.classList.add('hidden');
    });

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.textContent = '';
        errorMessage.classList.add('hidden');
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
