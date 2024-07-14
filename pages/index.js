import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const testCartItems = [
  {
    itemId: 1,
    itemName: "shampoo",
    itemPrice: 100,
    itemCount: 1,
  },
];

function getCurrentDateTime() {
  return new Date().toISOString();
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [unpaidItems, setUnpaidItems] = useState([]);
  const [search, setSearch] = useState("");
  const [screen, setScreen] = useState("cart");
  const [total, setTotal] = useState(0);
  const [isUnpaid, setUnpaid] = useState(false);
  const [customer, setCustomer] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Extract the token from the URL query parameters
    const { access_token, refresh_token } = router.query;

    if (access_token) {
      // Save the access token to local storage
      localStorage.setItem("accessToken", access_token);
    }

    if (refresh_token) {
      // Save the refresh token to local storage (if present)
      localStorage.setItem("refreshToken", refresh_token);
    }
  }, [router.query]);

  useEffect(() => {
    if (items.length <= 0) {
      axios
        .get(
          "https://sheets.googleapis.com/v4/spreadsheets/1LNdFrIRCG1iCXI45LRR9zJJW5q0mcg72hCdra6TPkGk/values/A2:D?key=AIzaSyCJ8YKn28Rm_xHMmbOLigwAKtQ50e7wigE"
        )
        .then((response) => {
          setItems(response.data.values);
        })
        .catch((error) => {
          console.error("There was an error!", error);
        });
      axios
        .get(
          "https://sheets.googleapis.com/v4/spreadsheets/1LNdFrIRCG1iCXI45LRR9zJJW5q0mcg72hCdra6TPkGk/values/Unpaid!A2:G?key=AIzaSyCJ8YKn28Rm_xHMmbOLigwAKtQ50e7wigE"
        )
        .then((response) => {
          console.log(response.data.values);
          const unpaidPrepare = [];
          response.data.values.forEach((value) => {
            unpaidPrepare.push({
              itemId: value[1],
              itemName: value[2],
              itemCount: value[3],
              itemPrice: value[4],
              itemCustomer: value[6],
            });
          });
          setUnpaidItems(unpaidPrepare);
        })
        .catch((error) => {
          console.error("There was an error!", error);
        });
    }
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

  const updateCounter = (e, id) => {
    setCartItems(
      cartItems.map((item) =>
        item.itemId === id
          ? { ...item, itemCount: parseInt(e.target.value) }
          : item
      )
    );
  };

  const addToCart = (cart) => {
    const index = cartItems.findIndex(
      (item) => item.itemId === parseInt(cart[0])
    );
    console.log(index);

    if (index >= 0) {
      setCartItems(
        cartItems.map((item) =>
          item.itemId === cartItems[index].itemId
            ? { ...item, itemCount: item.itemCount + 1 }
            : item
        )
      );
    } else {
      const newCartItem = {
        itemId: parseInt(cart[0]),
        itemName: cart[1],
        itemPrice: parseFloat(cart[2]),
        itemCount: 1,
      };
      setCartItems([...cartItems, newCartItem]);
    }
  };

  const checkout = (cart) => {
    addToCart(cart);
    setScreen("cart");
  };

  const submit = async () => {
    await axios.post(
      `/api/appendToSheet?status=${isUnpaid}&customer=${customer}`,
      cartItems
    );
    setCartItems([]);
  };

  const paid = async (id) => {
    const accessToken = localStorage.getItem("accessToken");
    // await axios.post(`/api/pay-unpaid`)
    const res = await axios.post(
      `https://script.googleapis.com/v1/scripts/AKfycbzwo82_mc-xrqcY9ImQwdhtj14nSviRepZfsc8lVyEPeibm-wMbbHavGi0CyK2ELCEuFg:run`,
      { function: "testMe", unpaidID: id },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(res);
    // await axios.post(`/api/appendToSheet?status=${isUnpaid}&customer=${customer}`, cartItems)
    setCartItems([]);
  };

  const calculateTotal = () => {
    let Total = 0;
    cartItems.forEach((item) => {
      Total += item.itemCount * item.itemPrice;
    });
    setTotal(Total);
  };

  const updateCustomer = (e) => {
    setCustomer(e.target.value);
  };

  const updateStatus = (e) => {
    setUnpaid(e.target.value);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    console.log(
      items.filter((fil) =>
        fil[1].toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };

  const handleLogin = () => {
    const clientId =
      "288300215893-0snni4euhsf2767ku9n9jbu5kkahkgoq.apps.googleusercontent.com";
    const redirectUri = "http://localhost:3000/api/auth";
    const scope =
      "email profile https://www.googleapis.com/auth/script.external_request";
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(
      scope
    )}&access_type=offline`;

    window.location.href = url;
  };
  return (
    <div className="flex min-h-screen flex-col items-center p-5 md:p-24">
      <div className="flex gap-2 mb-2">
        <div
          onClick={() => setScreen("items")}
          className={`p-2 ${
            screen === "items"
              ? "text-white bg-blue-700 rounded-lg hover:bg-blue-800"
              : "cursor-pointer"
          }`}
        >
          Item List
        </div>
        <div
          onClick={() => setScreen("cart")}
          className={`p-2 ${
            screen === "cart"
              ? "text-white bg-blue-700 rounded-lg hover:bg-blue-800"
              : "cursor-pointer"
          }`}
        >
          View Cart
        </div>
        <div
          onClick={() => setScreen("unpaid")}
          className={`p-2 ${
            screen === "unpaid"
              ? "text-white bg-blue-700 rounded-lg hover:bg-blue-800"
              : "cursor-pointer"
          }`}
        >
          View Unpaid
        </div>
      </div>
      <div></div>
      {screen == "items" && (
        <>
          <div className="mb-2">
            <form className="flex items-center">
              <label for="simple-search" className="sr-only">
                Search
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    ariaHidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2"
                    />
                  </svg>
                </div>
                <input
                  onChange={handleSearch}
                  type="text"
                  id="simple-search"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Search Item..."
                />
              </div>
              <button
                type="submit"
                className="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                <svg
                  className="w-4 h-4"
                  ariaHidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
                <span className="sr-only">Search</span>
              </button>
            </form>
            <div className="flex text-center lg:max-w-5xl lg:w-full lg:mb-0">
              <div>Food</div>
              <div>Food</div>
              <div>Food</div>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap justify-center">
            {items
              .filter((fil) =>
                fil[1].toLowerCase().includes(search.toLowerCase())
              )
              .map((item, index) => {
                return (
                  <div
                    key={index}
                    className="max-w-xs p-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
                  >
                    <a href="#">
                      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {item[1]}
                      </h5>
                    </a>
                    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                      {item[2]} ₱
                    </p>
                    <div className="flex flex-col gap-2">
                      <div
                        onClick={() => addToCart(item)}
                        href="#"
                        className="cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        Add to Cart
                      </div>
                      <div
                        onClick={() => checkout(item)}
                        href="#"
                        className="cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        Check-out
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}
      {screen == "cart" && (
        <>
          <div className="w-full px-10">
            {cartItems.map((cart, index) => {
              return (
                <div
                  key={index}
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 flex flex-row items-center justify-between gap-5"
                >
                  <div>
                    <div>{cart.itemName}</div>
                    <div>{cart.itemPrice} ₱</div>
                  </div>
                  <div>
                    <input
                      onChange={(e) => updateCounter(e, cart.itemId)}
                      type="number"
                      value={cart.itemCount}
                      className="border-2 max-w-12"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Customer Name"
              onChange={updateCustomer}
              value={customer}
              className="w-25 m-2.5 px-2.5 text-blue-600 rounded focus:ring-blue-500"
            />

            <input
              id="default-checkbox"
              type="checkbox"
              onChange={updateStatus}
              value={isUnpaid}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              for="default-checkbox"
              className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Mark as Unpaid
            </label>
          </div>
          <div className="text-lg">Total: {total}</div>
          <button
            onClick={submit}
            className="p-2 text-white bg-blue-700 rounded-lg hover:bg-blue-800"
          >
            submit
          </button>
        </>
      )}
      {screen == "unpaid" && (
        <div className="w-full px-10">
          {unpaidItems.map((cart, index) => {
            return (
              <div
                key={index}
                className="w-full mb-2 p-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 flex flex-row items-center justify-between gap-5"
              >
                <div>
                  <div>{cart.itemName}</div>
                  <div>{cart.itemPrice} ₱</div>
                </div>
                <button
                  onClick={() => paid(cart.itemId)}
                  className="p-2 text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                >
                  paid
                </button>
              </div>
            );
          })}
        </div>
      )}
      <button
        onClick={handleLogin}
        className="p-2 text-white bg-blue-700 rounded-lg hover:bg-blue-800"
      >
        test
      </button>

      {/* <div onClick={getItems} className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
          <Image
            className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
            src="/next.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
          />
        </div> */}
    </div>
  );
}
