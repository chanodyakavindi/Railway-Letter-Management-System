import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import MultiSelect from '../components/MultiSelect';
import Loading from '../components/Loading';
import { lettersApi } from '../api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { buildLetterFormData } from '../utils/helpers';
import { useParams } from "react-router-dom";

export default function ReplyToLetter() {
  const { id } = useParams();
  const location = useLocation();

  return (
    <div className="content-body">
      <h2>Reply Letter</h2>

      <p>Letter Title: {location.state?.title}</p>

      <div className="form-field-group">
        <label>Reply</label>

        <textarea
          rows="8"
          placeholder="Type your reply..."
        />
      </div>

      <button className="btn btn-primary">
        Submit Reply
      </button>
    </div>
  );
}