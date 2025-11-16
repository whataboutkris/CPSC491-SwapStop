import NavBar from "../components/NavBar";

export default function Guide() {


  return (
    <div  className = "bg-[#f3cd47]">
      <NavBar/>
        <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-6xl font-bold mb-4 text-[#00244E] text-center">How to Use SwapStop</h1>

        <section className="mb-10">
          <h2 className="text-4xl font-semibold mb-5 text-center text-[#00244E] ">1. First, Create Your Account</h2>
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
          <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            Click on the "Sign Up" button or click "Get Started"
            </h3>
            <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            Type in a Username
            </h3>
            <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            Type in your Email
            </h3>
            <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            Pick a password
            </h3>
            <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            Then click "Register"
            </h3>
          
        </section>

        <section>
          <h2 className="text-4xl font-semibold mb-5 text-center  text-[#00244E]">2.Now, let's create a Listing</h2>
          <video
            controls
            className="w-full rounded-lg border"
          >
            <source
              src="https://firebasestorage.googleapis.com/v0/b/swapstop-804be.firebasestorage.app/o/guide-videos%2FUploadListing.mp4?alt=media&token=a6af1e6a-d14c-4fec-9c18-bdebc315f0b1"
              type="video/mp4"
            />
            Your browser does not support videos.
          </video>
          <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            Navigate to the Shop Tab on the NavBar
            </h3>
            <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            Click on "Create Listing"
            </h3>
            <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            Use an accurate title for your item such as "Iphone 13"
            </h3>
            <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            Write a brief description
            </h3>
            <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            Choose the best price for your item
            </h3>
            <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            We will cover the Price Estimator Tool below
            </h3>
            <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            Select "Sell" or "Trade"
            </h3>
             <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            Write in the Brand
            </h3>
            <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            You MUST upload at least 1 image
            </h3>
             <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            Click on "Create Listing"
            </h3>
        </section>

 <section className="mb-10">
          <h2 className="text-4xl font-semibold mb-5 text-center text-[#00244E] ">3. Understanding the Price Estimator Tool</h2>
          <video
            controls
            className="w-full rounded-lg border"
          >
            <source
              src="https://firebasestorage.googleapis.com/v0/b/swapstop-804be.firebasestorage.app/o/guide-videos%2FUseThePriceEstimator.mp4?alt=media&token=35084168-0563-4fa3-bdd1-d4952a3456d9"
              type="video/mp4"
            />
            Your browser does not support videos.
          </video>
          <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            Click on the Price Estimator Tool "Find out what your item is worth!"
            </h3>
            <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            This gives you the Top 3 Prices that the item is being sold for right now
            </h3>
            <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            You can now decide how much you want to post your item for based on the Price Estimator
            </h3>
           
        </section>

        <section className="mb-10">
          <h2 className="text-4xl font-semibold mb-5 text-center text-[#00244E] ">4. Navigating your Shopping Cart</h2>
          <video
            controls
            className="w-full rounded-lg border"
          >
            <source
              src="https://firebasestorage.googleapis.com/v0/b/swapstop-804be.firebasestorage.app/o/guide-videos%2FShoppingCart.mp4?alt=media&token=1f586230-fae3-47d4-8702-6c742954def7"
              type="video/mp4"
            />
            Your browser does not support videos.
          </video>
          <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            Click on the "Shopping Cart Icon"
            </h3>
            <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            This will show you all the items in your Shopping Cart
            </h3>
            <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            You can remove items from here or Continue Shopping
            </h3>
            <h3 className= " display-linebreak text-xl font-semibold mt-5 mb-5 text-center" >
            As you add Items, a number will display for how many items are in your cart
            </h3>
           
        </section>

        </div>
    </div>
  );
}
