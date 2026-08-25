import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { CurriculumHubView } from './components/views/CurriculumHubView';
import { LessonView } from './components/views/LessonView';
import { SimulationsHubView } from './components/views/SimulationsHubView';
import { VirtualPhysicsLab } from './components/labs/VirtualPhysicsLab';
import { PracticeExamView } from './components/views/PracticeExamView';
import { PhysicsMindmap } from './components/mindmap/PhysicsMindmap';
import { RealLifeView } from './components/views/RealLifeView';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { VoicePhysicsTutor } from './components/voice/VoicePhysicsTutor';
import { CHAPTERS } from './data/curriculumData';

export default function App() {
  const totalLessons = CHAPTERS.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('LESSON');
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1); // Default to Bai 1: Lam quen voi Vat li
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('vatli10_completed_lessons');
      return saved ? JSON.parse(saved) : [1, 2, 3];
    } catch {
      return [1, 2, 3];
    }
  });

  // Sidebar visibility: true by default on desktop, collapsible via "Danh mục" button
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Sync completed lessons to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vatli10_completed_lessons', JSON.stringify(completedLessonIds));
    } catch (e) {
      console.error(e);
    }
  }, [completedLessonIds]);

  const handleToggleComplete = (lessonId: number) => {
    setCompletedLessonIds((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const handleSelectLesson = (lessonId: number) => {
    setSelectedLessonId(lessonId);
    setActiveTab('LESSON');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find currently selected lesson and chapter
  let currentLesson = CHAPTERS[0].lessons[0];
  let currentChapter = CHAPTERS[0];

  for (const ch of CHAPTERS) {
    const found = ch.lessons.find((l) => l.id === selectedLessonId);
    if (found) {
      currentLesson = found;
      currentChapter = ch;
      break;
    }
  }

  return (
    <div className="min-h-screen bg-[#050B18] bg-[radial-gradient(circle_at_top_right,_#0C1528,_#050B18)] text-slate-100 font-sans antialiased selection:bg-[#00D4FF] selection:text-black">
      {/* Top Navigation Bar with [Danh mục] toggle and action buttons */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        completedCount={completedLessonIds.length}
        totalLessons={totalLessons}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Layout Container */}
      <div className="flex w-full min-h-[calc(100vh-57px)] transition-all duration-300">
        {/* Left Sidebar (Curriculum Tree) */}
        {(activeTab === 'CURRICULUM' || activeTab === 'LESSON') && (
          <Sidebar
            selectedLessonId={selectedLessonId}
            onSelectLesson={handleSelectLesson}
            completedLessonIds={completedLessonIds}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}

        {/* Main Content Area: Expands smoothly to 100% when sidebar is closed */}
        <main className={`flex-1 p-3 sm:p-5 lg:p-6 min-w-0 transition-all duration-300 ${!isSidebarOpen ? 'w-full max-w-7xl mx-auto' : ''}`}>
          {activeTab === 'CURRICULUM' && (
            <CurriculumHubView
              onSelectLesson={handleSelectLesson}
              completedLessonIds={completedLessonIds}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'LESSON' && (
            <LessonView
              lesson={currentLesson}
              chapter={currentChapter}
              onToggleComplete={handleToggleComplete}
              isCompleted={completedLessonIds.includes(currentLesson.id)}
              onSelectLesson={handleSelectLesson}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'VOICE_TUTOR' && (
            <VoicePhysicsTutor
              currentLessonTitle={currentLesson.title}
              currentChapterTitle={currentChapter.title}
            />
          )}

          {activeTab === 'SIMULATIONS' && <SimulationsHubView />}

          {activeTab === 'VIRTUAL_LAB' && <VirtualPhysicsLab />}

          {activeTab === 'PRACTICE' && <PracticeExamView />}

          {activeTab === 'MINDMAP' && <PhysicsMindmap />}

          {activeTab === 'REAL_LIFE' && <RealLifeView />}

          {activeTab === 'TEACHER' && <TeacherDashboard />}
        </main>
      </div>
    </div>
  );
}

