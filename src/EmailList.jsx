import "./EmailList.css";
import { Checkbox, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EmailRow from "./EmailRow";
import InboxIcon from "@mui/icons-material/Inbox";
import KeyboardHideIcon from "@mui/icons-material/KeyboardHide";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleIcon from "@mui/icons-material/People";
import React from "react";
import RedoIcon from "@mui/icons-material/Redo";
import Section from "./Section";
import SettingsIcon from "@mui/icons-material/Settings";
import { auth } from "./firebase";
import { db } from "./firebase";
import { inboxErrorMessage, subscribeInbox } from './subscribeInbox';

function EmailList() {
  const [pageSize, setPageSize] = useState(50);
  const [loadError, setLoadError] = useState('');
  const [reloadVersion, setReloadVersion] = useState(0);
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user?.uid) return;
    setLoadError('');
    return subscribeInbox(db, user, pageSize, messages => {
      setEmails(messages);
      setLoadError('');
    }, error => {
      // Preserve the diagnostic without logging message contents or credentials.
      console.error('CoolMail inbox:', error.code || 'unknown');
      setLoadError(inboxErrorMessage(error));
    });
  }, [pageSize, reloadVersion]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Date non valide";

    try {
      const date = new Date(timestamp * 1000);
      return new Intl.DateTimeFormat("fr-FR", {
        weekday: "short", // Display only the first three letters of the day
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date non valide";
    }
  };

  return (
    <div className='emailList' onScroll={(e) => { const el = e.currentTarget; if (el.scrollHeight - el.scrollTop - el.clientHeight < 50 && emails.length === pageSize) setPageSize((size) => size + 50); }}>
      {loadError && <p role='alert'>{loadError}</p>}
      <div className='emailList__settings'>
        <div className='emailList__settingsLeft'>
          <Checkbox />
          <IconButton aria-label="Sélection">
          <ArrowDropDownIcon />
          </IconButton>
          <IconButton aria-label="Actualiser" onClick={() => setReloadVersion(version => version + 1)}>
          <RedoIcon />
          </IconButton>
          <IconButton aria-label="Plus d’options">
          <MoreVertIcon />
          </IconButton>
        </div>
        <div className='emailList__settingsRight'>
          <IconButton aria-label="Page précédente">
          <ChevronLeftIcon />
          </IconButton>
          <IconButton aria-label="Page suivante">
          <ChevronRightIcon />
          </IconButton>
          <IconButton aria-label="Clavier">
          <KeyboardHideIcon />
          </IconButton>
          <IconButton aria-label="Paramètres">
          <SettingsIcon />
          </IconButton>
        </div>
      </div>
      <div className='emailList__sections'>
        <Section Icon={InboxIcon} title='Principale' color='#1A73E8' selected />
        <Section Icon={LocalOfferIcon} title='Promotions' color='green' />
        <Section Icon={PeopleIcon} title='Réseaux sociaux' color='red' />
      </div>
      <div className='emailList__list'>
        {emails.map(({ id, data: { to, subject, message }, timestamp }) => (
          <EmailRow
            id={id}
            key={id}
            title={to}
            subject={subject}
            description={message}
            time={formatDate(timestamp)}
          />
        ))}
      </div>
    </div>
  );
}

export default EmailList;
