import { useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import {
  LinkedinShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinIcon,
  TwitterIcon,
  WhatsappIcon,
} from 'react-share';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import ShareScoreCard from '../components/gamification/ShareScoreCard';
import { useGamification } from '../hooks/useGamification';
import { useQuiz } from '../hooks/useQuiz';

export default function SocialSharePage() {
  const cardRef = useRef(null);
  const [imageUrl, setImageUrl] = useState('');
  const [type, setType] = useState('score');

  const { result } = useQuiz();
  const {
    profile,
    achievements,
    sharePayload,
    loadGamificationProfile,
    loadAchievements,
    createSharePayload,
    loading,
    errors,
  } = useGamification();

  useEffect(() => {
    loadGamificationProfile().catch(() => {});
    loadAchievements().catch(() => {});
  }, [loadGamificationProfile, loadAchievements]);

  const firstUnlockedAchievement = useMemo(
    () => achievements.find((item) => item.unlocked),
    [achievements]
  );

  async function handleGenerate() {
    const payload = { type };
    if (type === 'score' && result?.sessionId) {
      payload.sessionId = result.sessionId;
    }
    if (type === 'achievement' && firstUnlockedAchievement?.id) {
      payload.achievementId = firstUnlockedAchievement.id;
    }

    await createSharePayload(payload);
  }

  async function captureCard() {
    if (!cardRef.current) return;

    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null,
      scale: 2,
    });

    const dataUrl = canvas.toDataURL('image/png');
    setImageUrl(dataUrl);

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'smartquiz-share-card.png';
    link.click();
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">Social Share</h2>
        <p className="mt-1 text-sm text-slate-500">Generate score and achievement cards for social platforms.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant={type === 'score' ? 'primary' : 'secondary'} onClick={() => setType('score')}>Score Card</Button>
          <Button variant={type === 'achievement' ? 'primary' : 'secondary'} onClick={() => setType('achievement')}>Achievement Card</Button>
          <Button variant={type === 'profile' ? 'primary' : 'secondary'} onClick={() => setType('profile')}>Profile Card</Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={handleGenerate}
            disabled={loading.share || (type === 'score' && !result?.sessionId) || (type === 'achievement' && !firstUnlockedAchievement?.id)}
          >
            {loading.share ? 'Generating...' : 'Generate Share Data'}
          </Button>
          <Button variant="secondary" onClick={captureCard}>Download Card</Button>
        </div>

        {type === 'score' && !result?.sessionId ? (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">
            Complete a quiz first to generate a score share payload.
          </p>
        ) : null}
        {type === 'achievement' && !firstUnlockedAchievement?.id ? (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">
            Unlock at least one achievement to generate an achievement card.
          </p>
        ) : null}

        {errors.share ? <p className="mt-2 text-sm text-red-500">{errors.share}</p> : null}
      </section>

      {loading.profile ? <Loader text="Loading share profile..." /> : null}

      <div className="flex justify-center">
        <ShareScoreCard
          ref={cardRef}
          profile={profile}
          result={result || { totalPoints: 0, accuracy: 0, rank: null }}
          achievement={firstUnlockedAchievement}
          type={type}
        />
      </div>

      {sharePayload ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold">Share Text</h3>
          <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">{sharePayload.text}</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <WhatsappShareButton url="https://smartquiz.ai" title={sharePayload.text}>
              <WhatsappIcon size={40} round />
            </WhatsappShareButton>
            <TwitterShareButton url="https://smartquiz.ai" title={sharePayload.text}>
              <TwitterIcon size={40} round />
            </TwitterShareButton>
            <LinkedinShareButton url="https://smartquiz.ai" summary={sharePayload.text}>
              <LinkedinIcon size={40} round />
            </LinkedinShareButton>
            <a href={sharePayload.urls.instagram} target="_blank" rel="noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-pink-500 text-white">IG</a>
          </div>
        </section>
      ) : null}

      {imageUrl ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold">Generated Preview</h3>
          <img src={imageUrl} alt="Share preview" className="mt-3 w-full max-w-xl rounded-xl border border-slate-200" />
        </section>
      ) : null}
    </div>
  );
}
