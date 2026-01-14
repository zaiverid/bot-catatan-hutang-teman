const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs').promises;
const path = require('path');

const token = 'TOKEN_BOT_ANDA';
const bot = new TelegramBot(token, { polling: true });

const DATA_FILE = path.join(__dirname, 'data.json');

let hutangData = {};

async function loadData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        hutangData = JSON.parse(data);
    } catch (error) {
        hutangData = {};
        await saveData();
    }
}

async function saveData() {
    await fs.writeFile(DATA_FILE, JSON.stringify(hutangData, null, 2));
}

function formatCurrency(amount) {
    return `Rp ${amount.toLocaleString('id-ID')}`;
}

function createMainKeyboard() {
    return {
        reply_markup: {
            keyboard: [
                ['➕ Tambah Hutang', '📋 Lihat Hutang'],
                ['✅ Bayar Hutang', '🏆 Ranking 10 Terbesar'],
                ['📊 Ringkasan', '🗑️ Hapus Hutang']
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    };
}

function createCancelKeyboard() {
    return {
        reply_markup: {
            keyboard: [['❌ Batalkan']],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };
}

function createConfirmationKeyboard() {
    return {
        reply_markup: {
            keyboard: [
                ['✅ Ya', '❌ Tidak']
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };
}

bot.onText(/\/start/, async (msg) => {
    await loadData();
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Selamat datang di Bot Catatan Hutang!\nPilih menu:', createMainKeyboard());
});

bot.onText(/➕ Tambah Hutang/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Masukkan format:\nNama_Teman : Jumlah_Hutang\n\nContoh: Andi : 50000', createCancelKeyboard());
    bot.once('message', async (nextMsg) => {
        if (nextMsg.text === '❌ Batalkan') {
            bot.sendMessage(chatId, 'Dibatalkan.', createMainKeyboard());
            return;
        }
        try {
            const [nama, jumlah] = nextMsg.text.split(':').map(s => s.trim());
            const jumlahNumber = parseInt(jumlah.replace(/\D/g, ''));
            
            if (!nama || !jumlahNumber) {
                throw new Error();
            }
            
            if (!hutangData[chatId]) hutangData[chatId] = {};
            if (!hutangData[chatId][nama]) hutangData[chatId][nama] = 0;
            
            hutangData[chatId][nama] += jumlahNumber;
            await saveData();
            
            bot.sendMessage(chatId, `✅ Hutang ${nama} ditambahkan ${formatCurrency(jumlahNumber)}\nTotal: ${formatCurrency(hutangData[chatId][nama])}`, createMainKeyboard());
        } catch (error) {
            bot.sendMessage(chatId, '❌ Format salah! Gunakan: Nama : Jumlah', createMainKeyboard());
        }
    });
});

bot.onText(/📋 Lihat Hutang/, async (msg) => {
    const chatId = msg.chat.id;
    await loadData();
    
    if (!hutangData[chatId] || Object.keys(hutangData[chatId]).length === 0) {
        bot.sendMessage(chatId, '📭 Tidak ada catatan hutang.', createMainKeyboard());
        return;
    }
    
    let message = '📋 Daftar Hutang:\n\n';
    Object.entries(hutangData[chatId]).forEach(([nama, jumlah]) => {
        message += `👤 ${nama}: ${formatCurrency(jumlah)}\n`;
    });
    
    const total = Object.values(hutangData[chatId]).reduce((a, b) => a + b, 0);
    message += `\n💰 Total Hutang: ${formatCurrency(total)}`;
    
    bot.sendMessage(chatId, message, createMainKeyboard());
});

bot.onText(/✅ Bayar Hutang/, (msg) => {
    const chatId = msg.chat.id;
    
    if (!hutangData[chatId] || Object.keys(hutangData[chatId]).length === 0) {
        bot.sendMessage(chatId, '📭 Tidak ada hutang untuk dibayar.', createMainKeyboard());
        return;
    }
    
    let message = 'Pilih teman yang akan bayar hutang:\n\n';
    const friends = Object.keys(hutangData[chatId]);
    friends.forEach((friend, index) => {
        message += `${index + 1}. ${friend}: ${formatCurrency(hutangData[chatId][friend])}\n`;
    });
    
    bot.sendMessage(chatId, message, createCancelKeyboard());
    
    bot.once('message', async (nextMsg) => {
        if (nextMsg.text === '❌ Batalkan') {
            bot.sendMessage(chatId, 'Dibatalkan.', createMainKeyboard());
            return;
        }
        
        const selectedIndex = parseInt(nextMsg.text) - 1;
        if (selectedIndex >= 0 && selectedIndex < friends.length) {
            const selectedFriend = friends[selectedIndex];
            const currentAmount = hutangData[chatId][selectedFriend];
            
            bot.sendMessage(chatId, `Masukkan jumlah pembayaran untuk ${selectedFriend} (${formatCurrency(currentAmount)}):`, createCancelKeyboard());
            
            bot.once('message', async (amountMsg) => {
                if (amountMsg.text === '❌ Batalkan') {
                    bot.sendMessage(chatId, 'Dibatalkan.', createMainKeyboard());
                    return;
                }
                
                const payment = parseInt(amountMsg.text.replace(/\D/g, ''));
                if (!payment || payment <= 0) {
                    bot.sendMessage(chatId, '❌ Jumlah tidak valid!', createMainKeyboard());
                    return;
                }
                
                if (payment > currentAmount) {
                    bot.sendMessage(chatId, `❌ Pembayaran melebihi hutang! Hutang: ${formatCurrency(currentAmount)}`, createMainKeyboard());
                    return;
                }
                
                hutangData[chatId][selectedFriend] -= payment;
                
                if (hutangData[chatId][selectedFriend] === 0) {
                    delete hutangData[chatId][selectedFriend];
                    await saveData();
                    bot.sendMessage(chatId, `✅ Hutang ${selectedFriend} sudah lunas!`, createMainKeyboard());
                } else {
                    await saveData();
                    bot.sendMessage(chatId, `✅ Pembayaran diterima!\nSisa hutang ${selectedFriend}: ${formatCurrency(hutangData[chatId][selectedFriend])}`, createMainKeyboard());
                }
            });
        } else {
            bot.sendMessage(chatId, '❌ Pilihan tidak valid!', createMainKeyboard());
        }
    });
});

bot.onText(/🏆 Ranking 10 Terbesar/, async (msg) => {
    const chatId = msg.chat.id;
    await loadData();
    
    if (!hutangData[chatId] || Object.keys(hutangData[chatId]).length === 0) {
        bot.sendMessage(chatId, '📭 Tidak ada data hutang.', createMainKeyboard());
        return;
    }
    
    const entries = Object.entries(hutangData[chatId]);
    entries.sort((a, b) => b[1] - a[1]);
    const top10 = entries.slice(0, 10);
    
    let message = '🏆 10 Hutang Terbesar:\n\n';
    top10.forEach(([nama, jumlah], index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🔸';
        message += `${medal} ${nama}: ${formatCurrency(jumlah)}\n`;
    });
    
    const total = entries.reduce((sum, [, amount]) => sum + amount, 0);
    message += `\n💰 Total Semua Hutang: ${formatCurrency(total)}`;
    
    bot.sendMessage(chatId, message, createMainKeyboard());
});

bot.onText(/📊 Ringkasan/, async (msg) => {
    const chatId = msg.chat.id;
    await loadData();
    
    if (!hutangData[chatId] || Object.keys(hutangData[chatId]).length === 0) {
        bot.sendMessage(chatId, '📭 Tidak ada data hutang.', createMainKeyboard());
        return;
    }
    
    const entries = Object.entries(hutangData[chatId]);
    const total = entries.reduce((sum, [, amount]) => sum + amount, 0);
    const average = total / entries.length;
    const maxEntry = entries.reduce((max, curr) => curr[1] > max[1] ? curr : max);
    const minEntry = entries.reduce((min, curr) => curr[1] < min[1] ? curr : min);
    
    let message = '📊 Ringkasan Hutang:\n\n';
    message += `👥 Jumlah Orang: ${entries.length}\n`;
    message += `💰 Total Hutang: ${formatCurrency(total)}\n`;
    message += `📈 Rata-rata: ${formatCurrency(Math.round(average))}\n`;
    message += `⬆️ Tertinggi: ${maxEntry[0]} (${formatCurrency(maxEntry[1])})\n`;
    message += `⬇️ Terendah: ${minEntry[0]} (${formatCurrency(minEntry[1])})`;
    
    bot.sendMessage(chatId, message, createMainKeyboard());
});

bot.onText(/🗑️ Hapus Hutang/, (msg) => {
    const chatId = msg.chat.id;
    
    if (!hutangData[chatId] || Object.keys(hutangData[chatId]).length === 0) {
        bot.sendMessage(chatId, '📭 Tidak ada hutang untuk dihapus.', createMainKeyboard());
        return;
    }
    
    let message = 'Pilih hutang yang akan dihapus:\n\n';
    const friends = Object.keys(hutangData[chatId]);
    friends.forEach((friend, index) => {
        message += `${index + 1}. ${friend}: ${formatCurrency(hutangData[chatId][friend])}\n`;
    });
    message += '\n🔢 Ketik nomor yang ingin dihapus:';
    
    bot.sendMessage(chatId, message, createCancelKeyboard());
    
    bot.once('message', async (nextMsg) => {
        if (nextMsg.text === '❌ Batalkan') {
            bot.sendMessage(chatId, 'Dibatalkan.', createMainKeyboard());
            return;
        }
        
        const selectedIndex = parseInt(nextMsg.text) - 1;
        if (selectedIndex >= 0 && selectedIndex < friends.length) {
            const selectedFriend = friends[selectedIndex];
            
            bot.sendMessage(chatId, `Apakah yakin menghapus hutang ${selectedFriend} sebesar ${formatCurrency(hutangData[chatId][selectedFriend])}?`, createConfirmationKeyboard());
            
            bot.once('message', async (confirmMsg) => {
                if (confirmMsg.text === '✅ Ya') {
                    delete hutangData[chatId][selectedFriend];
                    if (Object.keys(hutangData[chatId]).length === 0) {
                        delete hutangData[chatId];
                    }
                    await saveData();
                    bot.sendMessage(chatId, `✅ Hutang ${selectedFriend} berhasil dihapus!`, createMainKeyboard());
                } else {
                    bot.sendMessage(chatId, 'Penghapusan dibatalkan.', createMainKeyboard());
                }
            });
        } else {
            bot.sendMessage(chatId, '❌ Pilihan tidak valid!', createMainKeyboard());
        }
    });
});

bot.on('message', (msg) => {
    if (!msg.text.startsWith('/') && 
        !['➕ Tambah Hutang', '📋 Lihat Hutang', '✅ Bayar Hutang', 
          '🏆 Ranking 10 Terbesar', '📊 Ringkasan', '🗑️ Hapus Hutang',
          '❌ Batalkan', '✅ Ya', '❌ Tidak'].includes(msg.text)) {
        bot.sendMessage(msg.chat.id, 'Gunakan tombol keyboard yang tersedia:', createMainKeyboard());
    }
});

console.log('Bot sedang berjalan...');
loadData();
