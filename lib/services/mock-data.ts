import { User, Page, Challenge, Comment, ChallengeParticipant } from "@/types";
import { encodeHtmlToDataUrl } from "@/lib/utils";

export const mockCurrentUser: User = {
  id: "user-1",
  email: "santiago@rraliados.com",
  name: "Santiago Rueda",
  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Santiago",
  bio: "CEO de RR ALIADOS. Constructor de comunidades.",
  role: "developer",
  points: 1250,
  level: 5,
  created_at: "2025-11-01T00:00:00Z",
  followers_count: 342,
  following_count: 12,
};

const mockUsers: User[] = [
  mockCurrentUser,
  {
    id: "user-2",
    email: "manu@example.com",
    name: "Manu Dev",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Manu",
    bio: "Frontend developer. Amante del running.",
    role: "developer",
    points: 980,
    level: 4,
    created_at: "2025-12-01T00:00:00Z",
    followers_count: 120,
    following_count: 45,
  },
  {
    id: "user-3",
    email: "patrocinador@proteina.com",
    name: "Proteina Plus",
    avatar_url: "https://api.dicebear.com/7.x/identicon/svg?seed=Proteina",
    bio: "Nutrición deportiva para retos de fitness.",
    role: "sponsor",
    points: 0,
    level: 1,
    created_at: "2026-01-01T00:00:00Z",
    followers_count: 0,
    following_count: 0,
  },
];

const page1Html = `
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>Fitness Tracker</title><style>
    body{font-family:sans-serif;background:#0F0F0F;color:#F5E6D3;padding:2rem;max-width:600px;margin:0 auto}
    h1{color:#CE3D1F}
    button{background:#CE3D1F;color:#F5E6D3;border:none;padding:10px 20px;border-radius:6px;cursor:pointer}
    input{width:100%;padding:10px;margin:8px 0;background:#1A1A1A;border:1px solid #333;color:#F5E6D3;border-radius:6px}
    .log{background:#1A1A1A;padding:1rem;border-radius:8px;margin-top:1rem}
  </style></head>
  <body>
    <h1>Fitness Tracker 🏃</h1>
    <p>Registra tus carreras diarias.</p>
    <input type="number" id="km" placeholder="Kilómetros">
    <input type="number" id="min" placeholder="Minutos">
    <button onclick="save()">Guardar carrera</button>
    <div class="log" id="log"></div>
    <script>
      const log = document.getElementById('log');
      let runs = JSON.parse(localStorage.getItem('runs') || '[]');
      function render() {
        var html = '';
        for (var i = 0; i < runs.length; i++) {
          html += '<div>' + runs[i].km + 'km en ' + runs[i].min + ' min</div>';
        }
        log.innerHTML = html || 'Sin carreras aún.';
      }
      function save() {
        var km = document.getElementById('km').value;
        var min = document.getElementById('min').value;
        if (km && min) { runs.push({km:km,min:min,date:new Date().toISOString()}); localStorage.setItem('runs', JSON.stringify(runs)); render(); }
      }
      render();
    </script>
  </body>
</html>
`;

const page2Html = `
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>Habit Tracker</title><style>
    body{font-family:sans-serif;background:#0F0F0F;color:#F5E6D3;padding:2rem;max-width:500px;margin:0 auto}
    h1{color:#CE3D1F}
    .habit{display:flex;align-items:center;justify-content:space-between;background:#1A1A1A;padding:12px;border-radius:8px;margin:8px 0}
    button{background:#3F0035;color:#F5E6D3;border:none;padding:8px 16px;border-radius:6px;cursor:pointer}
    button.done{background:#CE3D1F}
  </style></head>
  <body>
    <h1>Habit Tracker ✅</h1>
    <div id="habits"></div>
    <script>
      var habits = ['Leer 30 min', 'Beber 2L agua', 'Meditar 10 min', 'Caminar 5k', 'Dormir 8h'];
      var done = JSON.parse(localStorage.getItem('done') || '[]');
      function render() {
        var html = '';
        for (var i = 0; i < habits.length; i++) {
          var isDone = done.indexOf(i) > -1;
          html += '<div class="habit"><span>' + habits[i] + '</span><button class="' + (isDone ? 'done' : '') + '" onclick="toggle(' + i + ')">' + (isDone ? '✓' : 'Marcar') + '</button></div>';
        }
        document.getElementById('habits').innerHTML = html;
      }
      function toggle(i) {
        var idx = done.indexOf(i);
        if (idx > -1) done.splice(idx,1); else done.push(i);
        localStorage.setItem('done', JSON.stringify(done));
        render();
      }
      render();
    </script>
  </body>
</html>
`;

const page3Html = `
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>Pomodoro</title><style>
    body{font-family:sans-serif;background:#0F0F0F;color:#F5E6D3;padding:2rem;text-align:center}
    h1{color:#CE3D1F}
    #timer{font-size:4rem;font-weight:bold;margin:2rem 0}
    button{background:#CE3D1F;color:#F5E6D3;border:none;padding:12px 24px;margin:4px;border-radius:6px;cursor:pointer}
  </style></head>
  <body>
    <h1>Pomodoro ⏱️</h1>
    <div id="timer">25:00</div>
    <button onclick="start()">Iniciar</button>
    <button onclick="reset()">Reiniciar</button>
    <script>
      var time = 25*60, interval;
      function pad(n){ return n < 10 ? '0'+n : n; }
      function update() { document.getElementById('timer').textContent = pad(Math.floor(time/60)) + ':' + pad(time%60); }
      function start() { clearInterval(interval); interval = setInterval(function(){ if(time>0){time--; update();} }, 1000); }
      function reset() { clearInterval(interval); time=25*60; update(); }
    </script>
  </body>
</html>
`;

export const mockPages: Page[] = [
  {
    id: "page-1",
    author_id: "user-1",
    author: mockUsers[0],
    title: "Fitness Tracker",
    description: "Registra tus carreras diarias, guarda kilómetros y minutos. Ideal para retos de running.",
    category: "health",
    file_url: encodeHtmlToDataUrl(page1Html),
    is_open_source: true,
    source_code: page1Html,
    views: 1240,
    average_rating: 4.7,
    created_at: "2026-06-15T00:00:00Z",
    comments_count: 12,
  },
  {
    id: "page-2",
    author_id: "user-2",
    author: mockUsers[1],
    title: "Habit Tracker",
    description: "Mantén 7 hábitos positivos. Marca diariamente y construye rutinas.",
    category: "productivity",
    file_url: encodeHtmlToDataUrl(page2Html),
    is_open_source: false,
    source_code: null,
    views: 856,
    average_rating: 4.5,
    created_at: "2026-06-20T00:00:00Z",
    comments_count: 8,
  },
  {
    id: "page-3",
    author_id: "user-1",
    author: mockUsers[0],
    title: "Pomodoro Focus",
    description: "Temporizador Pomodoro de 25 minutos para sesiones de trabajo profundo.",
    category: "productivity",
    file_url: encodeHtmlToDataUrl(page3Html),
    is_open_source: true,
    source_code: page3Html,
    views: 2100,
    average_rating: 4.9,
    created_at: "2026-07-01T00:00:00Z",
    comments_count: 23,
  },
];

export const mockChallenges: Challenge[] = [
  {
    id: "challenge-1",
    page_id: "page-1",
    page: mockPages[0],
    creator_id: "user-1",
    creator: mockUsers[0],
    sponsor_id: "user-3",
    sponsor: mockUsers[2],
    title: "Corre 5km diarios por 30 días",
    description: "Usa Fitness Tracker todos los días. Sube screenshots de Strava como evidencia.",
    duration_days: 30,
    goal_type: "daily_usage",
    goal_value: 30,
    reward_text: "3 meses de proteína del patrocinador",
    sponsor_message: "Cada día más cerca de la proteína de nuestro patrocinador.",
    is_active: true,
    created_at: "2026-07-01T00:00:00Z",
    participants_count: 45,
    completed_count: 3,
  },
  {
    id: "challenge-2",
    page_id: "page-2",
    page: mockPages[1],
    creator_id: "user-2",
    creator: mockUsers[1],
    sponsor_id: null,
    sponsor: undefined,
    title: "7 hábitos por 21 días",
    description: "Mantén tus 7 hábitos positivos durante 21 días con el Habit Tracker.",
    duration_days: 21,
    goal_type: "daily_usage",
    goal_value: 21,
    reward_text: "Badge Hábitos de Acero",
    sponsor_message: null,
    is_active: true,
    created_at: "2026-07-05T00:00:00Z",
    participants_count: 120,
    completed_count: 12,
  },
];

export const mockComments: Comment[] = [
  {
    id: "comment-1",
    page_id: "page-1",
    user_id: "user-2",
    user: mockUsers[1],
    parent_id: null,
    content: "Me encantó, lo usaré para mi entrenamiento de 5K.",
    created_at: "2026-06-16T00:00:00Z",
  },
  {
    id: "comment-2",
    page_id: "page-1",
    user_id: "user-1",
    user: mockUsers[0],
    parent_id: null,
    content: "¡Gracias! Pronto agregaré exportación a CSV.",
    created_at: "2026-06-17T00:00:00Z",
  },
];

export const mockParticipants: ChallengeParticipant[] = [
  {
    id: "part-1",
    challenge_id: "challenge-1",
    user_id: "user-2",
    user: mockUsers[1],
    progress: 18,
    completed: false,
    completed_at: null,
  },
];

export const follows = new Set<string>(["user-2"]);

export function getUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}

export function getPageById(id: string): Page | undefined {
  return mockPages.find((p) => p.id === id);
}

export function getChallengeById(id: string): Challenge | undefined {
  return mockChallenges.find((c) => c.id === id);
}

export { mockUsers };
