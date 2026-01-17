import React from "react";
import { Link } from "react-router-dom";

const Button = ({ children, active, linkto }) => {
  return (
    <Link to={linkto}>
      <div
        className={`inline-flex items-center justify-center rounded-full px-7 py-3 text-center text-[13px] font-semibold sm:text-[15px] transition-all duration-300 ease-out
        ${active
            ? "bg-gradient-to-r from-yellow-50 via-yellow-25 to-caribbeangreen-100 text-richblack-900 shadow-[0_18px_45px_rgba(202,138,4,0.55)] hover:-translate-y-[2px] hover:shadow-[0_24px_70px_rgba(202,138,4,0.7)]"
            : "bg-richblack-800/80 text-richblack-25 border border-richblack-600 shadow-[0_14px_40px_rgba(0,0,0,0.7)] hover:border-yellow-25/80 hover:text-yellow-25 hover:-translate-y-[1px]"
          }`}
      >
        {children}
      </div>
    </Link>
  );
};

export default Button;