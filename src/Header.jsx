import "./Header.css";

import { Avatar, IconButton } from "@mui/material";
import { logout, selectUser } from "./features/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import AppsIcon from "@mui/icons-material/Apps";
import { ArrowDropDown } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";

function Header() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/");
  };

  const logUserOut = () => {
    signOut(auth)
      .then(() => dispatch(logout()))
      .catch((e) => alert(e.message));
  };
  return (
    <div className='header'>
      <div className='header__left' onClick={handleClick}>
        <IconButton aria-label="Accueil">
          <MenuIcon />
        </IconButton>
        <img src='/email.svg' alt='' className='header__logo' />
        <p className='header__logoLabel'>COOLMAIL</p>
      </div>
      <div className='header__middle'>
        <SearchIcon />
        <input aria-label='Rechercher dans les messages' type='text' placeholder='Rechercher dans les messages' />
        <ArrowDropDown className='header__inputCaret' />
      </div>
      <div className='header__right'>
        <IconButton aria-label="Applications">
          <AppsIcon />
        </IconButton>
        <IconButton aria-label="Notifications">
          <NotificationsIcon />
        </IconButton>
        <Avatar role='button' tabIndex={0} aria-label='Se déconnecter' onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); logUserOut(); } }} onClick={logUserOut} src={user?.photoURL} />
      </div>
    </div>
  );
}

export default Header;
