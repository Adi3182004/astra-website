async function testFetch() {
  try {
    const res = await fetch("https://oriibywxfetfpcpstdyk.supabase.co/rest/v1/", {
      headers: {
        apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1Nzg4NjQsImV4cCI6MjEwMzE1NDg2NH0.YUAArFtyH3su7iru8QgCK_UiwDAHBhecg1MH7XWQikY",
      },
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}
testFetch();
