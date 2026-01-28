'use client';

import { useState, useEffect } from 'react';
import { Save, ExternalLink, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function VJudgeSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [settings, setSettings] = useState({
        organiser_username: '',
        organiser_password: '',
        contest_id: '',
        contest_password: '',
        session_cookies: '',
        problem_count: 10,
        problem_titles: '',
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/vjudge-settings');
            if (res.ok) {
                const data = await res.json();
                setSettings({
                    organiser_username: data.organiser_username || '',
                    organiser_password: data.organiser_password || '',
                    contest_id: data.contest_id || '',
                    contest_password: data.contest_password || '',
                    session_cookies: data.session_cookies || '',
                    problem_count: data.problem_count || 10,
                    problem_titles: data.problem_titles || '',
                });
            }
        } catch (error) {
            console.error('Error fetching VJudge settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/admin/vjudge-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
            } else {
                const error = await res.json();
                setMessage({ type: 'error', text: error.error || 'Failed to save settings' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete the VJudge contest settings? This cannot be undone.')) {
            return;
        }

        setDeleting(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/admin/vjudge-settings', {
                method: 'DELETE',
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Contest settings deleted successfully!' });
                // Reset form
                setSettings({
                    organiser_username: '',
                    organiser_password: '',
                    contest_id: '',
                    contest_password: '',
                    session_cookies: '',
                    problem_count: 10,
                    problem_titles: '',
                });
            } else {
                const error = await res.json();
                setMessage({ type: 'error', text: error.error || 'Failed to delete settings' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Image
                    src="/tc-logo_circle.svg"
                    alt="Loading"
                    width={60}
                    height={60}
                    className="animate-spin"
                />
                <p className="text-gray-400">
                    Fetching settings
                    <span className="inline-flex ml-1">
                        <span className="animate-pulse-dot">.</span>
                        <span className="animate-pulse-dot animation-delay-200">.</span>
                        <span className="animate-pulse-dot animation-delay-400">.</span>
                    </span>
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">VJudge CP Contests Configuration</h2>
                <p className="text-gray-400 text-sm">
                    Configure the organiser account and contest ID. These credentials are used to fetch private contest data and leaderboards.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-6">
                    <div className="bg-[#C9A227]/5 border border-[#C9A227]/20 rounded-xl p-4 mb-4">
                        <h4 className="text-[#C9A227] font-bold mb-2 flex items-center gap-2 text-sm">
                            <AlertTriangle size={16} /> How to get Session Cookies
                        </h4>
                        <ol className="text-xs text-gray-400 list-decimal pl-4 space-y-1">
                            <li>Log in to <a href="https://vjudge.net" target="_blank" className="text-[#C9A227] hover:underline">vjudge.net</a> in your browser.</li>
                            <li>Open DevTools (F12) → <strong>Console</strong></li>
                            <li>In your console write <code>document.cookie</code> and copy the entire snippet which starts like <code>JSESSIONID=...</code></li>
                            <li>Paste them below. This lasts until you log out or the session expires.</li>
                        </ol>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            VJudge Session Cookies
                        </label>
                        <textarea
                            value={settings.session_cookies}
                            onChange={(e) => setSettings({ ...settings, session_cookies: e.target.value })}
                            className="w-full h-24 rounded-xl border border-[#C9A227]/30 bg-black px-4 py-3 text-white focus:border-[#C9A227] focus:outline-none transition-all font-mono text-xs"
                            placeholder="e.g. JSESSIONID=...; Jax.Quest.Session=..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Active Contest ID
                            </label>
                            <input
                                type="text"
                                value={settings.contest_id}
                                onChange={(e) => setSettings({ ...settings, contest_id: e.target.value })}
                                className="w-full rounded-xl border border-[#C9A227]/30 bg-black px-4 py-3 text-white focus:border-[#C9A227] focus:outline-none transition-all"
                                placeholder="e.g., 684234"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Contest Password (Optional)
                            </label>
                            <input
                                type="password"
                                value={settings.contest_password}
                                onChange={(e) => setSettings({ ...settings, contest_password: e.target.value })}
                                className="w-full rounded-xl border border-[#C9A227]/30 bg-black px-4 py-3 text-white focus:border-[#C9A227] focus:outline-none transition-all"
                                placeholder="For private contests"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Number of Problems
                            </label>
                            <input
                                type="number"
                                value={settings.problem_count}
                                onChange={(e) => setSettings({ ...settings, problem_count: parseInt(e.target.value) || 0 })}
                                className="w-full rounded-xl border border-[#C9A227]/30 bg-black px-4 py-3 text-white focus:border-[#C9A227] focus:outline-none transition-all"
                                min="1"
                                max="26"
                                required
                            />
                            <p className="mt-1 text-[10px] text-gray-500">How many problems are in this contest? (e.g., 10 for A-J)</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Problem Titles (Optional)
                        </label>
                        <textarea
                            value={settings.problem_titles}
                            onChange={(e) => setSettings({ ...settings, problem_titles: e.target.value })}
                            className="w-full h-20 rounded-xl border border-[#C9A227]/30 bg-black px-4 py-3 text-white focus:border-[#C9A227] focus:outline-none transition-all font-mono text-xs"
                            placeholder="e.g., string-check, matrix-color, alphabet-max, remove-char, skill-combo"
                        />
                        <p className="mt-1 text-[10px] text-gray-500">Enter problem titles separated by commas. Leave blank to show just letters (A, B, C...).</p>
                    </div>

                    <div className="pt-4 border-t border-white/10 opacity-50 italic">
                        <p className="text-[10px] text-gray-500">
                            Organiser credentials (username/password) are no longer used for login due to VJudge bot protection.
                        </p>
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/50 text-green-400' : 'bg-red-500/10 border border-red-500/50 text-red-400'
                        }`}>
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                        <span className="text-sm">{message.text}</span>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 rounded-xl bg-[#C9A227] px-6 py-3 font-semibold text-black hover:bg-[#B8901E] transition-all disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                        <Trash2 size={18} />
                        {deleting ? 'Deleting...' : 'Delete Contest'}
                    </button>

                    <a
                        href={`https://vjudge.net/contest/${settings.contest_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#C9A227] hover:underline text-sm"
                    >
                        <ExternalLink size={16} />
                        View Contest on VJudge
                    </a>
                </div>
            </form>
        </div>
    );
}
