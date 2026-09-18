import { Link } from "react-router"
import ScoreCircle from "./ScoreCircle"
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";

interface ResumeCardProps {
  resume: Resume;
  onDelete?: (id: string) => void;
}

const ResumeCard = ({ resume : { id, companyName, jobTitle, feedback, imagePath, resumePath }, onDelete } : ResumeCardProps) => {
  const { fs, kv } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
      const loadResume = async () => {
        const blob = await fs.read(imagePath);
        if(!blob) return;
        let url = URL.createObjectURL(blob);
        setResumeUrl(url);
      }

      loadResume();
    }, [imagePath]);

    const handleDelete = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDeleting(true);
      setDeleteError('');
      try {
        // Delete the KV record first — this is the source of truth for the
        // home list, so it must succeed for the resume to actually disappear.
        await kv.delete(`resume:${id}`);

        // Best-effort file cleanup: don't let a failure here undo the
        // deletion above, but do report it.
        try {
          await fs.delete(imagePath);
          await fs.delete(resumePath);
        } catch (cleanupError) {
          console.error("Failed to clean up resume files:", cleanupError);
        }

        onDelete?.(id);
      } catch (error) {
        console.error("Failed to delete resume:", error);
        setDeleteError("Couldn't delete this resume. Try again.");
        setDeleting(false);
      }
    }

  return (
    <div className="relative resume-card animate-in fade-in duration-1000">
      <Link to={`/resume/${id}`} className="flex flex-col gap-8">
        <div className="resume-card-header">
          <div className="flex flex-col gap-2">
            {companyName && <h2 className="text-black! font-bold wrap-break-word">{companyName}</h2>}
            {jobTitle && <h3 className="text-lg wrap-break-word text-gray-500">{jobTitle}</h3>}
            {!companyName && !jobTitle && <h2 className="text-black! font-bold">Resume</h2>}
          </div>
          <div className="shrink-0">
            <ScoreCircle score={feedback.overallScore} />
          </div>
        </div>
        {resumeUrl && (
          <div className="gradient-border animate-in fade-in duration-1000">
            <div className="w-full h-full">
              <img
                src={resumeUrl}
                alt="resume"
                className="w-full h-87.5 max-sm:h-50 object-cover object-top"
              />
            </div>
          </div>
        )}
      </Link>

      {onDelete && (
        confirming ? (
          <div
            className="absolute top-2 right-2 flex flex-col gap-2 bg-white rounded-xl shadow-md border border-gray-100 p-3 z-10 w-44"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-gray-600">Delete this resume?</p>
            {deleteError && (
              <p className="text-xs text-red-600">{deleteError}</p>
            )}
            <div className="flex flex-row gap-2">
              <button
                className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer disabled:opacity-50"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer disabled:opacity-50"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirming(false); setDeleteError(''); }}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-red-50 cursor-pointer z-10"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirming(true); }}
            aria-label="Delete resume"
          >
            <img src="/icons/cross.svg" alt="delete" className="w-3 h-3" />
          </button>
        )
      )}
    </div>
  )
}

export default ResumeCard