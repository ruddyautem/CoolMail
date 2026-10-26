import './Mail.css';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import ErrorIcon from '@mui/icons-material/Error';
import ExitToAppIcon from '@mui/icons-material/MoreVert';
import { IconButton } from '@mui/material';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import PrintIcon from '@mui/icons-material/Print';
import React from 'react';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import { selectOpenMail } from './features/mailSlice';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Mail() {
  const navigate = useNavigate();
  const selectedMail = useSelector(selectOpenMail);
  if (!selectedMail) return <Navigate to='/' replace />;
  return (
    <div className='mail'>
      <div className='mail__tools'>
        <div className='mail__toolsLeft'>
          <IconButton
            onClick={() => {
              navigate('/');
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton aria-label="Archiver">
          <MoveToInboxIcon />
          </IconButton>
          <IconButton aria-label="Supprimer">
          <DeleteIcon />
          </IconButton>
          <IconButton aria-label="Signaler">
          <ErrorIcon />
          </IconButton>
          <IconButton aria-label="Marquer comme non lu">
          <EmailIcon />
          </IconButton>
          <IconButton aria-label="Reporter">
          <WatchLaterIcon />
          </IconButton>
          <IconButton aria-label="Terminer">
          <CheckCircleIcon />
          </IconButton>
          <IconButton aria-label="Important">
          <LabelImportantIcon />
          </IconButton>
          <IconButton aria-label="Plus d’options">
          <MoreVertIcon />
          </IconButton>
        </div>
        <div className='mail__toolsRight'>
          <IconButton aria-label="Développer">
          <UnfoldMoreIcon />
          </IconButton>
          <IconButton aria-label="Imprimer">
          <PrintIcon />
          </IconButton>
          <IconButton aria-label="Plus d’options">
          <ExitToAppIcon />
          </IconButton>
        </div>
      </div>
      <div className='mail__body'>
        <div className='mail__bodyHeader'>
          <h2>{selectedMail?.subject}</h2>
          <LabelImportantIcon className='mail__important' />
          <p>{selectedMail.title}</p>

          <p className='mail__time'>{selectedMail?.time}</p>
        </div>
        <div className='mail__message'>
          <p>{selectedMail?.description}</p>
        </div>
      </div>
    </div>
  );
}

export default Mail;
