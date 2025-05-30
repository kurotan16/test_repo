// Supabaseクライアントの初期化
// あなたのSupabaseプロジェクトのURLとanonキーに置き換えてください
const SUPABASE_URL = 'https://shuvmeluxncaprfabgsj.supabase.co'; // あなたのSupabaseプロジェクトのURL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNodXZtZWx1eG5jYXByZmFiZ3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NzAzODIsImV4cCI6MjA2NDE0NjM4Mn0.uyYVl2u0tH0UzZKdwSBZhbxgLqmOac8Q0-0qaftagtE';

// グローバルの supabase オブジェクトから createClient を呼び出し、
// 結果を新しい変数 supabaseClient に格納する
const { createClient } = supabase; // supabase v2の推奨される書き方 (グローバル `supabase` オブジェクトから `createClient` を取り出す)
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); // クライアントインスタンスを作成

// DOM要素の取得
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const logoutButton = document.getElementById('logoutButton');
const messageDiv = document.getElementById('message');

const authSection = document.getElementById('authSection');
const userSection = document.getElementById('userSection');
const userInfoP = document.getElementById('userInfo');
const userProfileInfoP = document.getElementById('userProfileInfo');

const signupFormContainer = document.getElementById('signupFormContainer');
const loginFormContainer = document.getElementById('loginFormContainer');
const showLoginLink = document.getElementById('showLogin');
const showSignupLink = document.getElementById('showSignup');

// --- UI制御 ---
function showLoginForm() {
    signupFormContainer.classList.add('hidden');
    loginFormContainer.classList.remove('hidden');
}

function showSignupForm() {
    loginFormContainer.classList.add('hidden');
    signupFormContainer.classList.remove('hidden');
}

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
    clearMessage();
});

showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSignupForm();
    clearMessage();
});


// --- メッセージ表示 ---
function showMessage(text, type = 'info') {
    messageDiv.textContent = text;
    messageDiv.className = type; // 'success' or 'error' or 'info'
    if (type === 'info') messageDiv.className = ''; // デフォルトのスタイル
}

function clearMessage() {
    messageDiv.textContent = '';
    messageDiv.className = '';
}

// --- 認証状態に基づいてUIを更新 ---
async function updateUserUI(user) {
    if (user) {
        authSection.classList.add('hidden');
        userSection.classList.remove('hidden');
        userInfoP.textContent = `メールアドレス: ${user.email}`;

        // プロファイル情報を取得
        const { data: profile, error: profileError } = await supabaseClient // <--- 変更
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('id', user.id)
            .single(); // ユーザーIDに紐づくプロファイルは1つのはず

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116: no rows found
            console.error('プロファイル取得エラー:', profileError);
            userProfileInfoP.textContent = 'プロファイル情報の取得に失敗しました。';
        } else if (profile) {
            let profileText = `ユーザー名: ${profile.username || '未設定'}`;
            if (profile.full_name) profileText += `, フルネーム: ${profile.full_name}`;
            if (profile.avatar_url) profileText += `, アバターURL: ${profile.avatar_url}`;
            userProfileInfoP.textContent = profileText;
        } else {
            userProfileInfoP.textContent = 'プロファイル情報が見つかりません。';
        }

    } else {
        authSection.classList.remove('hidden');
        userSection.classList.add('hidden');
        userInfoP.textContent = '';
        userProfileInfoP.textContent = '';
        showSignupForm(); // ログアウト後は新規登録フォームをデフォルト表示
    }
    clearMessage();
}

// --- イベントリスナー ---

// 新規登録
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessage();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const username = document.getElementById('signupUsername').value;
        const fullName = document.getElementById('signupFullName').value;

        // SupabaseのsignUpメソッドはoptions.dataで追加情報を渡せる
        // これがトリガー関数内の NEW.raw_user_meta_data で参照される
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    full_name: fullName || null // 空の場合はnull
                }
            }
        });

        if (error) {
            showMessage(`登録エラー: ${error.message}`, 'error');
            console.error('Signup error:', error);
        } else {
            // data.user が null の場合、メール認証が有効になっている可能性がある
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                 showMessage('確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。', 'success');
            } else if (data.user) {
                 showMessage('登録成功！自動的にログインしました。', 'success');
                 // updateUserUI(data.user); // onAuthStateChangeで処理されるので不要な場合もある
            } else {
                 showMessage('確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。', 'success');
            }
            signupForm.reset();
        }
    });
}

// ログイン
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessage();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            showMessage(`ログインエラー: ${error.message}`, 'error');
            console.error('Login error:', error);
        } else {
            // showMessage('ログイン成功！', 'success'); // onAuthStateChangeでUI更新するので不要
            // updateUserUI(data.user); // onAuthStateChangeで処理されるので不要な場合もある
            loginForm.reset();
        }
    });
}

// ログアウト
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        clearMessage();
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            showMessage(`ログアウトエラー: ${error.message}`, 'error');
            console.error('Logout error:', error);
        } else {
            // showMessage('ログアウトしました。', 'info'); // onAuthStateChangeでUI更新するので不要
        }
    });
}

// --- 認証状態の監視 ---
// ページ読み込み時と認証状態の変更時に現在のユーザーセッションを確認
async function checkUserSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    updateUserUI(session?.user ?? null);
}

// 認証状態の変更をリッスン (ログイン、ログアウト、トークン更新など)
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event, session);
    updateUserUI(session?.user ?? null);

    if (event === 'SIGNED_IN') {
        showMessage('ログインしました！', 'success');
    } else if (event === 'SIGNED_OUT') {
        showMessage('ログアウトしました。', 'info');
    }
    // INITIAL_SESSION イベントは最初のセッション取得時に発生
});


// --- 初期化処理 ---
// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
    checkUserSession(); // 初期セッション確認
});