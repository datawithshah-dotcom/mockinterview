async function submitExam() {
    answers[currentIndex] = document.getElementById('answerBox').value;
    clearInterval(timerInterval);

    let correct = 0;
    let strengths = new Set();
    let weaknesses = new Set();

    selectedQuestions.forEach((q,i)=>{
        let ans = (answers[i]||'').toLowerCase();
        let keywords = q.answer.toLowerCase().split(/[\s,.;]+/);
        let matched = keywords.filter(k => k && ans.includes(k));
        if(matched.length >= Math.max(1, Math.floor(keywords.length/2))){
            correct++;
            strengths.add(q.topic);
        } else {
            weaknesses.add(q.topic);
        }
    });

    const total = selectedQuestions.length;
    const percent = Math.round((correct/total)*100);
    const status = percent >= 80 ? 'PASS' : 'FAIL';

    // ✅ Create exam record
    const record = {
        examId,
        userName,
        userEmail,
        status,
        score: `${correct}/${total}`,
        percent,
        answers
    };

    // ✅ Save history to localStorage with serial number
    let history = JSON.parse(localStorage.getItem('mockHistory') || '[]');
    let serial = history.length + 1;
    record.serial = serial;
    history.push(record);
    localStorage.setItem('mockHistory', JSON.stringify(history));

    // ✅ Send to serverless backend (optional)
    try {
        const res = await fetch("https://mockinterview-i63vnnym2-shahnawazs-projects-f5eff102.vercel.app/api/submitExam", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(record)
        });
        const data = await res.json();
        console.log("Saved to backend:", data);
    } catch(err) {
        console.error("Failed to save to backend:", err);
    }

    renderResult(correct, total, percent, status, Array.from(strengths), Array.from(weaknesses));
}
