import NavBar from "../components/NavBar";

export default function Guide() {
  return (
    <div  className = "bg-[#f3cd47]">
      <NavBar/>
        <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-5xl font-bold mb-4 text-[#00244E] text-center">How to Use SwapStop</h1>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2 text-[#00244E] ">Create Your Account</h2>
          <video
            controls
            className="w-full rounded-lg border"
          >
            <source
              src="https://firebasestorage.googleapis.com/v0/b/swapstop-804be.firebasestorage.app/o/guide-videos%2FUserRegVid.mp4?alt=media&token=9e465a52-7d51-42cb-9199-aa04708a2d7d"
              type="video/mp4"
            />
            Your browser does not support videos.
          </video>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">How to Create a Listing</h2>
          <video
            controls
            className="w-full rounded-lg border"
          >
            <source
              src=""
              type="video/mp4"
            />
          </video>
        </section>
        </div>
    </div>
  );
}
