import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { reviewAPI } from '@services/api';
import { formatDate, getErrorMessage } from '@utils/helpers';
import Badge from '@components/ui/Badge';
import Pagination from '@components/ui/Pagination';
import Modal from '@components/ui/Modal';
import { TableRowSkeleton } from '@components/ui/SkeletonLoader';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import toast from 'react-hot-toast';
import { MdStar, MdCheck, MdVisibilityOff, MdDelete, MdReply } from 'react-icons/md';

const Reviews = () => {
  const [page, setPage]         = useState(1);
  const [filter, setFilter]     = useState('');  // 'pending' | 'approved' | ''
  const [selected, setSelected] = useState(null);
  const [replyModal, setReplyModal] = useState(false);
  const [reply, setReply]       = useState('');
  const qc = useQueryClient();

  const params = { page, limit: 15 };
  if (filter === 'pending')  params.isApproved = 'false';
  if (filter === 'approved') params.isApproved = 'true';

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', page, filter],
    queryFn: () => reviewAPI.adminGetAll(params),
    select: d => d.data,   // d.data = { success, data: [...], pagination: {...} }
  });

  const reviews    = data?.data || [];
  const pagination = data?.pagination;

  const moderate = useMutation({
    mutationFn: ({ id, action, reply }) => reviewAPI.moderate(id, { action, reply }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Review updated.'); setReplyModal(false); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const ACTION_BTN = ({ id, action, icon, color, title }) => (
    <button onClick={() => moderate.mutate({ id, action })} title={title}
      className={`p-1.5 rounded-lg transition-colors ${color}`}>
      {icon}
    </button>
  );

  return (
    <>
      <Helmet><title>Reviews – Admin</title></Helmet>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Reviews</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 border-b border-border">
          {[{v:'', l:'All'},{v:'pending', l:'Pending'},{v:'approved', l:'Approved'}].map(t => (
            <button key={t.v} onClick={() => { setFilter(t.v); setPage(1); }}
              className={`pb-3 text-sm font-medium transition-colors ${filter === t.v ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text-primary'}`}>
              {t.l}
            </button>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-raised border-b border-border">
              <tr>
                {['Product', 'Customer', 'Rating', 'Review', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                : reviews.length === 0
                  ? <tr><td colSpan={7} className="py-12 text-center text-text-muted">No reviews found.</td></tr>
                  : reviews.map(r => (
                    <tr key={r._id} className="border-b border-border last:border-0 hover:bg-surface-raised/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {r.product?.images?.[0]?.url && (
                            <img src={r.product.images[0].url} alt="" className="w-8 h-8 rounded-lg object-cover border border-border" />
                          )}
                          <span className="text-xs text-text-secondary max-w-[120px] truncate">{r.product?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-xs">{r.user?.name}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-0.5 text-yellow-400 text-xs">
                          {Array.from({length: r.rating}).map((_, i) => <MdStar key={i} size={12} />)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-xs max-w-[180px]">
                        <p className="truncate">{r.comment}</p>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={r.isApproved ? 'success' : 'warning'}>{r.isApproved ? 'Approved' : 'Pending'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {!r.isApproved && (
                            <ACTION_BTN id={r._id} action="approve" title="Approve"
                              icon={<MdCheck size={15} />}
                              color="hover:bg-green-50 dark:hover:bg-green-500/10 text-green-500" />
                          )}
                          <ACTION_BTN id={r._id} action={r.isHidden ? 'unhide' : 'hide'} title={r.isHidden ? 'Unhide' : 'Hide'}
                            icon={<MdVisibilityOff size={15} />}
                            color="hover:bg-yellow-50 dark:hover:bg-yellow-500/10 text-yellow-500" />
                          <button onClick={() => { setSelected(r); setReply(r.adminReply?.comment || ''); setReplyModal(true); }}
                            title="Reply"
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-colors">
                            <MdReply size={15} />
                          </button>
                          <ACTION_BTN id={r._id} action="delete" title="Delete"
                            icon={<MdDelete size={15} />}
                            color="hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500" />
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
          {pagination?.pages > 1 && (
            <div className="px-4 py-3 border-t border-border">
              <Pagination {...pagination} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>

      <Modal open={replyModal} onClose={() => setReplyModal(false)} title="Reply to Review" size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setReplyModal(false)}>Cancel</Button>
            <Button loading={moderate.isPending}
              onClick={() => moderate.mutate({ id: selected._id, action: 'reply', reply })}>
              Send Reply
            </Button>
          </>
        }>
        <div className="space-y-4">
          <div className="bg-surface-raised rounded-lg p-4 text-sm text-text-secondary">
            <p className="font-medium text-text-primary mb-1">{selected?.user?.name} said:</p>
            <p>"{selected?.comment}"</p>
          </div>
          <Input label="Your Reply" value={reply} onChange={e => setReply(e.target.value)}
            placeholder="Write your reply…" />
        </div>
      </Modal>
    </>
  );
};

export default Reviews;
