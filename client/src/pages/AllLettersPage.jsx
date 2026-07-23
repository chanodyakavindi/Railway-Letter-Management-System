import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom'; 
// NEW CHANGE: Added useNavigate to navigate to reply page with selected letter ID

import Header from '../components/Header';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import LetterDetailsModal from '../components/LetterDetailsModal';
import { lettersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate, getLetterRowClasses } from '../utils/helpers';

export default function AllLettersPage() {

  const { hasRole, user } = useAuth();
  const { showToast } = useToast();

  // NEW CHANGE: Created navigate function for redirecting to reply form
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const [filters, setFilters] = useState({
    status: '',
    search: '',
    recipient: '',
    dateFrom: '',
    dateTo: ''
  });


  const load = () => {
    setLoading(true);

    lettersApi.list({
      ...filters,
      excludeSourceType: 'reply'
    })
    .then(({ data }) => setLetters(data))
    .finally(() => setLoading(false));
  };


  useEffect(() => {

    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const recipient = searchParams.get('recipient') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    setFilters({
      status,
      search,
      recipient,
      dateFrom,
      dateTo
    });

  }, [searchParams]);


  useEffect(() => {
    load();
  }, [filters]);



  // NEW CHANGE: Redirect user to Add Letter page with reply letter ID
  const replyToLetter = (id) => {

    // The ID will be used in AddLetter.jsx to fetch original letter details
    navigate(`/add-letter?replyFrom=${id}`);

  };



  const canEdit = (l) =>
    hasRole('officer') &&
    l.createdBy?._id === user?._id;

  const canModify = (l) => canEdit(l) && l.status !== 'Completed';



  const recipientsSummary = (l) => {

    const to = l.sendTo || [];
    const cc = l.sendCopiesTo || [];

    const values = [
      ...to,
      ...cc
    ];

    return values.length
      ? values.slice(0, 3).join(', ')
      : '-';
  };


  return (
    <>

      <Header
        title="All Letters / සියලු ලිපි"
        search={filters.search}
        onSearch={(v) =>
          setFilters((f)=>({
            ...f,
            search:v
          }))
        }
      />


      <div className="content-body">

        <div className="all-letters-legend-bar">

          <div className="legend-items">

            <div className="legend-chip chip-upcoming">
              <span className="chip-swatch" />
              Draft / New
            </div>


            <div className="legend-chip chip-overdue">
              <span className="chip-swatch" />
              Overdue / No Action
            </div>


            <div className="legend-chip chip-normal">
              <span className="chip-swatch" />
              Completed
            </div>


          </div>

        </div>



        <div className="card">


          <div className="card-header flex-column-mobile">

            <h3>
              All Correspondence Letters
            </h3>


            {
              hasRole('officer') &&
              <Link
                to="/add-letter"
                className="btn btn-primary btn-sm"
              >
                + Register New
              </Link>
            }


          </div>



          <div
            className="filters-row"
            style={{
              padding:'0 20px 16px'
            }}
          >

            <select
              value={filters.status}
              onChange={(e)=>
                setFilters((f)=>({
                  ...f,
                  status:e.target.value
                }))
              }
            >

              <option value="">
                All Status
              </option>

              <option value="Draft">
                Draft
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Overdue">
                Overdue
              </option>

              <option value="NoAction">
                No Action
              </option>


            </select>



            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e)=>
                setFilters((f)=>({
                  ...f,
                  dateFrom:e.target.value
                }))
              }
            />


            <input
              type="date"
              value={filters.dateTo}
              onChange={(e)=>
                setFilters((f)=>({
                  ...f,
                  dateTo:e.target.value
                }))
              }
            />


          </div>

          {
            loading ? 
            <Loading /> :

            letters.length === 0 ?

            <EmptyState
              title="No letters found"
              message="Try adjusting filters or create a new letter."/>:

            <div className="table-scroll-container">

              <table className="data-table al-table">
                <colgroup>
                  <col className="col-id" />
                  <col className="col-date" />
                  <col className="col-subject" />
                  <col className="col-org" />
                  <col className="col-status" />
                  <col className="col-date" />
                  <col className="col-list" />
                  <col className="col-person" />
                  <col className="col-actions-wide" />
                </colgroup>

                <thead>

                  <tr>

                    <th>Letter ID</th>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Organization</th>
                    <th>Status</th>
                    <th>Reminder</th>
                    <th>Recipients</th>
                    <th>Created By</th>
                    <th className="actions-column-header">Actions</th>

                  </tr>

                </thead>

                <tbody>

                {
                  letters.map((l)=>(

                  <tr
                    key={l._id}
                    className={
                      getLetterRowClasses(
                        l.status,
                        l.reminderStatus
                      )
                    }
                  >


                    <td className="cell-id">{l.letterId}</td>

                    <td className="cell-date">
                      {formatDate(l.dateReceived)}
                    </td>

                    <td>
                      <span className="cell-wrap" title={l.title || ''}>{l.title}</span>
                    </td>

                    <td>
                      <span className="cell-wrap" title={l.referredEntity || ''}>{l.referredEntity}</span>
                    </td>

                    <td className="cell-status">
                      <StatusBadge
                        status={l.status}
                        reminderStatus={l.reminderStatus}
                      />
                    </td>

                    <td className="cell-date">
                      {formatDate(l.reminderDate)}
                    </td>

                    <td>
                      <span className="cell-wrap" title={recipientsSummary(l)}>{recipientsSummary(l)}</span>
                    </td>


                    <td>
                      <span className="cell-wrap" title={l.createdBy?.fullName || ''}>{l.createdBy?.fullName}</span>
                    </td>


                    <td className="actions-cell">
                      <div className="actions-cell-inner">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelected(l)}
                      >
                        View
                      </button>



                      {
                        canModify(l) &&

                        <Link
                          to={`/add-letter?edit=${l._id}`}
                          className="btn btn-secondary btn-sm">Edit
                        </Link>
                      }

                      {
                        canModify(l) &&

                        <button
                          type="button"
                          className="btn btn-primary btn-sm"

                          // NEW CHANGE: Sends selected letter ID to reply handler
                          onClick={() => replyToLetter(l._id)}>Reply to letter</button>

                      }
                      </div>
                    </td></tr>

                  ))
                }
                </tbody>

              </table>

            </div>

          }

        </div>

      </div>

      <LetterDetailsModal
        letter={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />


    </>
  );
}