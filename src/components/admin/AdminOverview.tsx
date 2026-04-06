// src/components/admin/AdminOverview.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  freeUsers: number;
  premiumUsers: number;
  totalChapters: number;
  publishedChapters: number;
  draftChapters: number;
  pendingReviews: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    freeUsers: 0,
    premiumUsers: 0,
    totalChapters: 0,
    publishedChapters: 0,
    draftChapters: 0,
    pendingReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users
        const usersRes = await fetch('/api/admin/users');
        const usersData = await usersRes.json();
        const users = usersData.users || [];

        // Fetch chapters
        const chaptersRes = await fetch('/api/admin/guide');
        const chaptersData = await chaptersRes.json();
        const chapters = chaptersData.chapters || [];

        // Fetch pending reviews count
        const reviewsRes = await fetch('/api/admin/reviews?status=pending');
        const reviewsData = await reviewsRes.json();

        setStats({
          totalUsers: users.length,
          freeUsers: users.filter((u: any) => u.role === 'user').length,
          premiumUsers: users.filter((u: any) => u.role === 'premium').length,
          totalChapters: chapters.length,
          publishedChapters: chapters.filter((c: any) => c.status === 'published').length,
          draftChapters: chapters.filter((c: any) => c.status === 'draft').length,
          pendingReviews: reviewsData.count ?? 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-10">
        <p className="text-gray-400">Laden...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-4xl">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Dashboard
        </h1>
        <p className="text-gray-500 mb-8">
          Übersicht über dein Rio für Deutsche Projekt
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Benutzer gesamt</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalUsers}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Kostenlos</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.freeUsers}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">⭐ Premium</p>
            <p className="text-3xl font-bold text-yellow-600">
              {stats.premiumUsers}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Kapitel gesamt</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalChapters}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">● Veröffentlicht</p>
            <p className="text-3xl font-bold text-green-600">
              {stats.publishedChapters}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">○ Entwürfe</p>
            <p className="text-3xl font-bold text-yellow-600">
              {stats.draftChapters}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Schnellzugriff
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/users"
            className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group"
          >
            <span className="text-3xl">👥</span>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-green-700">
                Benutzer verwalten
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Benutzer suchen, Premium vergeben ou widerrufen.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/guide"
            className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group"
          >
            <span className="text-3xl">📖</span>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-green-700">
                Guide-Inhalte
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Kapitel erstellen, bearbeiten und veröffentlichen.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/guide/new"
            className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group"
          >
            <span className="text-3xl">✏️</span>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-green-700">
                Neues Kapitel
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Ein neues Kapitel für den Guide erstellen.
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group"
          >
            <span className="text-3xl">👁️</span>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-green-700">
                Guide-Vorschau
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Den Guide so sehen, wie deine Benutzer ihn sehen.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/bewertungen"
            className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group"
          >
            <span className="text-3xl">⭐</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 group-hover:text-green-700">
                  Bewertungen
                </h3>
                {stats.pendingReviews > 0 && (
                  <span className="px-2 py-0.5 bg-yellow-400 text-black text-xs font-bold rounded-full">
                    {stats.pendingReviews} ausstehend
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Nutzerbewertungen prüfen und freischalten.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
