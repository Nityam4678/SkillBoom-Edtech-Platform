import { useEffect, useState } from "react"
import { AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai"
import { BsChevronDown } from "react-icons/bs"
import { useSelector } from "react-redux"
import { Link, matchPath, useLocation } from "react-router-dom"

import logo from "../../assets/Logo/Logo-Full-Light.png"
import { NavbarLinks } from "../../data/navbar-links"
import { apiConnector } from "../../services/apiconnector"
import { categories } from "../../services/apis"
import { ACCOUNT_TYPE } from "../../utils/constants"
import ProfileDropdown from "../core/Auth/ProfileDropDown"

function Navbar() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { totalItems } = useSelector((state) => state.cart)
  const location = useLocation()

  const [subLinks, setSubLinks] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API)
        setSubLinks(res?.data?.data || [])
      } catch (error) {
      }
      setLoading(false)
    }

    fetchCategories()
  }, [])

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <div
      className="
        sticky top-0 z-[1000] relative
        flex h-16 items-center justify-center
        border-b border-white/10
        bg-[radial-gradient(ellipse_at_center,_#1a2a3a_0%,_#0f172a_45%,_#020617_100%)]
        backdrop-blur-sm
        transition-all duration-200
      "
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">

        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-6 text-richblack-25 font-medium">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <div
                    className={`group relative flex cursor-pointer items-center gap-1 ${
                      matchRoute("/catalog/:catalogName")
                        ? "text-yellow-25"
                        : "text-richblack-25"
                    }`}
                  >
                    <span>{link.title}</span>
                    <BsChevronDown />

                    {/* Dropdown */}
                    <div className="invisible absolute left-1/2 top-full z-[1000]
                      mt-4 w-[260px] -translate-x-1/2 rounded-xl
                      bg-richblack-5 p-3 text-richblack-800
                      opacity-0 shadow-2xl transition-all duration-150
                      group-hover:visible group-hover:opacity-100">

                      {/* Arrow */}
                      <div className="absolute left-1/2 top-0 h-4 w-4
                        -translate-x-1/2 -translate-y-1/2 rotate-45
                        bg-richblack-5">
                      </div>

                      {loading ? (
                        <p className="text-center text-sm">Loading...</p>
                      ) : subLinks.length > 0 ? (
                        subLinks.map((subLink, i) => (
                          <Link
                            to={`/catalog/${subLink.name
                              .split(" ")
                              .join("-")
                              .toLowerCase()}`}
                            key={i}
                            className="flex items-center justify-between
                              rounded-md px-3 py-2 hover:bg-richblack-50"
                          >
                            <span>{subLink.name}</span>
                            {subLink.courses.length === 0 && (
                              <span className="text-xs text-richblack-400">
                                No courses
                              </span>
                            )}
                          </Link>
                        ))
                      ) : (
                        <p className="text-center text-sm">
                          No Categories Found
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link to={link.path}>
                    <p
                      className={`transition-colors ${
                        matchRoute(link.path)
                          ? "text-yellow-25"
                          : "text-richblack-25 hover:text-yellow-25"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Section */}
        <div className="hidden items-center gap-x-4 md:flex">

          {user && user.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {totalItems > 0 && (
                <span className="absolute -bottom-2 -right-2 grid h-5 w-5
                  place-items-center rounded-full bg-yellow-400
                  text-xs font-bold text-black">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {token === null && (
            <>
              <Link to="/login">
                <button className="rounded-md border border-white/20
                  bg-white/10 px-3 py-2 text-richblack-25
                  hover:bg-white/20">
                  Log in
                </button>
              </Link>
              <Link to="/signup">
                <button className="rounded-md bg-yellow-400 px-3 py-2
                  font-semibold text-black hover:bg-yellow-300">
                  Sign up
                </button>
              </Link>
            </>
          )}

          {token !== null && <ProfileDropdown />}
        </div>

        {/* Mobile Menu */}
        <button className="mr-4 md:hidden">
          <AiOutlineMenu size={24} className="text-richblack-25" />
        </button>

      </div>
    </div>
  )
}

export default Navbar
