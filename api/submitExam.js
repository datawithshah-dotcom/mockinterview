// /api/submitExam.js
let submissions = []; // temporary in-memory store (resets on every redeploy)

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // ✅ Parse incoming JSON data
      const data = req.body;

      if (!data || !data.examId || !data.userName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // ✅ Store the submission (temporary)
      const saved = {
        id: submissions.length + 1,
        timestamp: new Date().toISOString(),
        ...data,
      };
      submissions.push(saved);

      console.log("📥 Received new submission:", saved);

      return res.status(200).json({
        message: "✅ Exam submitted successfully!",
        record: saved,
        totalSubmissions: submissions.length,
      });
    } catch (error) {
      console.error("❌ API Error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // ✅ Allow checking all submissions (optional)
  if (req.method === "GET") {
    return res.status(200).json({
      message: "📄 List of all submissions (temporary storage)",
      submissions,
    });
  }

  // ✅ If any other method is used
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
