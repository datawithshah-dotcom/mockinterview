async function submitExam() {
    // ✅ Save the last answer typed by the user
    const answerBox = document.getElementById('answerBox');
    if (answerBox) {
        answers[currentIndex] = answerBox.value.trim();
    }
    clearInterval(timerInterval);

    let correct = 0;
    let strengths = new Set();
    let weaknesses = new Set();

    // ✅ Keyword-based evaluation
    selectedQuestions.forEach((q, i) => {
        let ans = (answers[i] || '').toLowerCase();
        let keywords = q.answer.toLowerCase().split(/[\s,.;]+/);
        let matched = keywords.filter(k => k && ans.includes(k));

        if (matched.length >= Math.max(1, Math.floor(keywords.length / 2))) {
            correct++;
            strengths.add(q.topic);
        } else {
            weaknesses.add(q.topic);
        }
    });

    const total = selectedQuestions.length;
    const percent = Math.round((correct / total) * 100);
    const status = percent >= 80 ? 'PASS' : 'FAIL';

    // ✅ Prepare exam record
    const record = {
        examId,
        userName,
        userEmail,
        status,
        score: `${correct}/${total}`,
        percent,
        answers,
        submittedAt: new Date().toISOString()
    };

    // ✅ Save to localStorage with serial number
    let history = JSON.parse(localStorage.getItem('mockHistory') || '[]');
    record.serial = history.length + 1;
    history.push(record);
    localStorage.setItem('mockHistory', JSON.stringify(history));

    // ✅ Send to Vercel API (backend)
    try {
        const res = await fetch("https://mockinterview-i63vnnym2-shahnawazs-projects-f5eff102.vercel.app/api/submitExam", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record)
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();
        console.log("✅ Saved to backend:", data);
    } catch (err) {
        console.error("❌ Failed to save to backend:", err.message);
    }

    // ✅ Show result page
    renderResult(correct, total, percent, status, Array.from(strengths), Array.from(weaknesses));
}
