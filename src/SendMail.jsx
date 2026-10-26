import "./SendMail.css";

import { addDoc, serverTimestamp } from "firebase/firestore";
import { dbEmailRef } from "./firebase.js";

import { Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { closeSendMessage } from "./features/mailSlice";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";

function SendMail() {
  const dispatch = useDispatch();
  const [sendError, setSendError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    setSendError('');
    try {
      const user = getAuth().currentUser;
      if (!user?.email) throw new Error('Veuillez vous reconnecter.');
      await addDoc(dbEmailRef, {
        senderUid: user.uid, senderEmail: user.email,
        recipientEmail: formData.to.trim().toLowerCase(),
        to: formData.to.trim(), subject: formData.subject.trim(),
        message: formData.message.trim(), timestamp: serverTimestamp(),
      });
      window.dispatchEvent(new Event('mail-sent'));
      dispatch(closeSendMessage());
    } catch { setSendError("Le message n'a pas été enregistré. Votre brouillon est conservé."); }
  };

  return (
    <div className='sendMail'>
      <div className='sendMail__header'>
        <h3>Nouveau Message</h3>
        <CloseIcon
          className='sendMail__close' role='button' tabIndex={0} aria-label='Fermer le message'
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!isSubmitting) dispatch(closeSendMessage()); } }}
          onClick={() => { if (!isSubmitting) dispatch(closeSendMessage()); }}
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          aria-label='Destinataire'
          name='to'
          placeholder='À'
          type='email'
          maxLength={254} {...register("to", { required: true, maxLength: 254 })}
        />
        {errors.to && <p className='sendMail__error'>To is required!</p>}
        <input
          aria-label='Sujet' name='subject'
          placeholder='Sujet'
          type='text'
          maxLength={200} {...register("subject", { required: true, maxLength: 200, validate: value => !!value.trim() })}
        />
        {errors.subject && (
          <p className='sendMail__error'>Subject is required!</p>
        )}
        <input
          aria-label='Message' name='message'
          className='sendMail__message'
          placeholder='Message...'
          type='text'
          maxLength={20000} {...register("message", { required: true, maxLength: 20000, validate: value => !!value.trim() })}
        />
        {errors.message && (
          <p className='sendMail__error'>Message is required!</p>
        )}
        {sendError && <p className='sendMail__error' role='alert'>{sendError}</p>}
        <div className='sendMail__options'>
          <Button
            className='sendMail__send'
            variant='contained'
            color='primary'
            type='submit' disabled={isSubmitting}
          >
            Envoyer
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SendMail;
