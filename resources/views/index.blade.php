<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Memopad - Sistem Catatan & Fokus Kreatif</title>
    <!-- Google Fonts: Outfit -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Top Navbar -->
    <div id="nav-top-side" class="d-flex align-items-center justify-content-between px-4 py-2">
        <div id="logo-wrapper">
            <i class="bi bi-journal-check text-warning" style="font-size: 28px;"></i>
            <span>Memopad</span>
        </div>
        <div id="search-wrapper" class="flex-grow-1 mx-4 d-flex justify-content-center">
             <input class="form-control" id="search" type="search" placeholder="Cari catatan atau tag..." autocomplete="off">
        </div>
        <div class="d-flex align-items-center gap-2">
            <button id="btn-layout-toggle" class="tool-btn" title="Tampilan Baris">
                <i class="bi bi-view-list"></i>
            </button>
            <div id="night-mode">
                <button id="btn-theme-toggle" class="tool-btn" title="Ubah Tema">
                    <i class="bi bi-moon-stars"></i>
                </button>
            </div>
        </div>
    </div>

    <div class="main-layout">
        <!-- Sidebar Kiri -->
        <div id="nav-left-side">
            <div class="sidebar-item active" data-view="notes">
                <i class="bi bi-lightbulb"></i>
                <span>Catatan</span>
            </div>
            <div class="sidebar-item" data-view="reminders">
                <i class="bi bi-bell"></i>
                <span>Pengingat</span>
            </div>
            <div class="sidebar-item" data-view="pomodoro">
                <i class="bi bi-hourglass-split"></i>
                <span>Pomodoro Timer</span>
            </div>
            <div class="sidebar-item" data-view="archive">
                <i class="bi bi-archive"></i>
                <span>Arsip</span>
            </div>
            <div class="sidebar-item" data-view="trash">
                <i class="bi bi-trash"></i>
                <span>Sampah</span>
            </div>
            
            <div class="labels-header text-uppercase text-secondary small px-4 mt-4 mb-2 d-none">Label</div>
            <div id="sidebar-labels-list"></div>
        </div>

        <!-- Konten Utama -->
        <div id="content-wrapper">
            
            <!-- VIEW: CATATAN & REMINDERS & ARCHIVE & TRASH -->
            <div id="notes-container">
                <!-- Form Input Catatan -->
                <div id="form-area" class="mx-auto">
                    <div id="trigger-form" class="d-flex align-items-center px-3 py-2 rounded shadow-sm">
                        Buat catatan baru...
                    </div>
                    <div id="form" class="d-none rounded shadow-sm">
                        <input id="fill-title" class="fill-title d-block w-100 rounded border-0 px-3 pt-3 data-content" type="text" name="title" placeholder="Judul" autocomplete="off">
                        <textarea id="fill-content" class="d-block w-100 rounded border-0 px-3 py-2 data-content" name="content" placeholder="Buat catatan..."></textarea>
                        
                        <!-- Tools Form Bar -->
                        <div class="action-bar px-3 py-2">
                            <div class="action-tools align-items-center">
                                <button type="button" id="form-palette-btn" class="tool-btn" title="Ubah warna latar">
                                    <i class="bi bi-palette"></i>
                                </button>
                                <!-- Label Input -->
                                <div class="d-flex align-items-center gap-1 border-end pe-2 me-2">
                                    <i class="bi bi-tag text-secondary" style="font-size: 14px;"></i>
                                    <input type="text" id="form-label" class="border-0 bg-transparent text-secondary small" style="width: 80px; outline: none; font-size: 12px;" placeholder="Label..." title="Tambah Label">
                                </div>
                                <!-- DateTime Reminder Picker -->
                                <div class="d-flex align-items-center gap-1">
                                    <i class="bi bi-bell text-secondary" style="font-size: 14px;"></i>
                                    <input type="datetime-local" id="form-reminder" class="border-0 bg-transparent text-secondary small" style="outline: none; font-size: 12px;" title="Setel pengingat">
                                </div>
                            </div>
                            <div>
                                <button type="button" id="btn-close" class="btn btn-sm btn-dark px-3 rounded-pill">Tutup</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Grid Catatan Pinned -->
                <div id="pinned-section-title" class="notes-section-title d-none">Disematkan</div>
                <div id="pinned-notes-area"></div>

                <!-- Grid Catatan Biasa / Lainnya -->
                <div id="others-section-title" class="notes-section-title d-none">Lainnya</div>
                <div id="notes-area" class="row"></div>
                
                <!-- Empty State -->
                <div id="empty-state" class="d-none w-100 text-center text-secondary">
                    <i class="bi bi-journal-x" style="font-size: 48px;"></i>
                    <p class="mt-2 fs-5">Tidak ada catatan ditemukan</p>
                </div>
            </div>

            <!-- VIEW: POMODORO TIMER -->
            <div id="pomodoro-container" class="d-none">
                <div id="pomodoro-view">
                    <h4 class="mb-4 text-primary fw-bold">Fokus Pomodoro</h4>
                    <div class="pomodoro-tabs">
                        <button class="pomodoro-tab active" data-minutes="25">Fokus (25m)</button>
                        <button class="pomodoro-tab" data-minutes="5">Istirahat Pendek (5m)</button>
                        <button class="pomodoro-tab" data-minutes="15">Istirahat Panjang (15m)</button>
                    </div>

                    <div class="timer-circle-container">
                        <svg class="timer-svg" viewBox="0 0 220 220">
                            <circle class="timer-circle-bg" cx="110" cy="110" r="100"></circle>
                            <circle id="timer-progress" class="timer-circle-progress" cx="110" cy="110" r="100" stroke-dasharray="628.3" stroke-dashoffset="0"></circle>
                        </svg>
                        <div id="timer-display" class="timer-display">25:00</div>
                    </div>

                    <div class="pomodoro-controls">
                        <button id="pomo-start" class="pomo-btn pomo-btn-primary rounded-pill">Mulai</button>
                        <button id="pomo-pause" class="pomo-btn pomo-btn-primary bg-danger border-danger rounded-pill d-none">Jeda</button>
                        <button id="pomo-reset" class="pomo-btn pomo-btn-secondary rounded-pill">Reset</button>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <!-- MODAL: EDIT NOTE -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header border-0 pb-0 justify-content-end p-2">
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pt-0 pb-2">
                    <input id="fill-title-edit" class="d-block w-100 border-0 px-4 py-2" type="text" name="title" placeholder="Judul" autocomplete="off">
                    <textarea id="fill-content-edit" class="d-block w-100 border-0 px-4 py-2" name="content" placeholder="Buat catatan..."></textarea>
                    
                    <!-- Collapsible Reminder Input Row -->
                    <div id="modal-reminder-wrapper" class="d-none px-4 py-2 border-top mt-3">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-bell text-secondary"></i>
                            <input type="datetime-local" id="edit-reminder" class="form-control form-control-sm border-0 bg-transparent text-secondary p-0" style="outline: none;">
                        </div>
                    </div>
                    
                    <!-- Collapsible Label Input Row -->
                    <div id="modal-label-wrapper" class="d-none px-4 py-2 border-top">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-tag text-secondary"></i>
                            <input type="text" id="edit-label" class="form-control form-control-sm border-0 bg-transparent text-secondary p-0" style="outline: none;" placeholder="Ketik label/tag...">
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-0 d-flex justify-content-between pt-0" id="footer-modal">
                    <!-- Left: Navigation Icon Toolbar -->
                    <div class="d-flex gap-1 edit-tool-control align-items-center">
                        <button type="button" id="btn-reminder-edit-trigger" class="tool-btn" title="Setel pengingat">
                            <i class="bi bi-bell"></i>
                        </button>
                        <button type="button" id="btn-color-edit" class="tool-btn" title="Ubah warna">
                            <i class="bi bi-palette"></i>
                        </button>
                        <button type="button" id="btn-label-edit-trigger" class="tool-btn" title="Ubah label">
                            <i class="bi bi-tag"></i>
                        </button>
                        <button type="button" id="btn-archive-edit" class="tool-btn" title="Arsip">
                            <i class="bi bi-archive"></i>
                        </button>
                        <button type="button" id="btn-delete" class="tool-btn text-danger" title="Hapus">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                    <!-- Right: Close Button -->
                    <div>
                        <button type="button" id="btn-close-update" class="btn btn-dark px-3 rounded-pill">Tutup</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL: ALARM NOTIFIKASI -->
    <div class="modal fade" id="alarmModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-body alarm-modal-body">
                    <div class="alarm-icon-wrapper">
                        <i class="bi bi-bell-fill"></i>
                    </div>
                    <div class="alarm-title-text text-warning">Waktunya Pengingat!</div>
                    <h5 id="alarm-title" class="fw-bold mb-2">Catatan Judul</h5>
                    <p id="alarm-content" class="alarm-content-text">Isi catatan...</p>
                </div>
                <div class="modal-footer border-0 justify-content-center gap-3 pb-4">
                    <button type="button" id="btn-alarm-snooze" class="btn btn-outline-secondary px-3 py-2 rounded-pill"><i class="bi bi-alarm"></i> Tunda 5 Mnt</button>
                    <button type="button" id="btn-alarm-complete" class="btn btn-warning px-4 py-2 rounded-pill fw-bold text-dark"><i class="bi bi-check2-circle"></i> Selesai</button>
                    <button type="button" id="btn-alarm-close" class="btn btn-light px-3 py-2 rounded-pill d-none">Tutup</button>
                </div>
            </div>
        </div>
    </div>

    @vite(['resources/js/Notes/initialize.js'])
</body>
</html>