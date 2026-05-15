
    const API_BASE = window.location.origin;
    let allFiles = [];
    let allTags = [];
    
    // 分页状态
    let currentPage = 1;
    let pageSize = 10;
    
    // 展示模式状态
    let viewMode = localStorage.getItem('viewMode') || 'grid';
    
    // 排序状态
    let sortBy = 'scanned_at';
    let sortOrder = 'DESC';
    
    // 查询模式: 'browse' | 'search' | 'typeFilter' | 'tagFilter'
    let currentMode = 'browse';
    let currentQuery = '';
    
    // 书签状态
    let bookmarkedIds = new Set();
    
    // 批量选择
    let selectedIds = new Set();
    
    // 初始化
    document.addEventListener('DOMContentLoaded', () => {
      loadStats();
      loadFiles();
      loadTags();
      loadBookmarked();
      
      // 从 localStorage 恢复排序偏好
      sortBy = localStorage.getItem('sortBy') || 'scanned_at';
      sortOrder = localStorage.getItem('sortOrder') || 'DESC';
      document.getElementById('sortBy').value = sortBy;
      document.getElementById('sortOrder').value = sortOrder;
      
      // 搜索防抖
      let searchTimeout;
      document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => searchFiles(e.target.value), 300);
      });
      
      document.getElementById('typeFilter').addEventListener('change', filterFiles);
      document.getElementById('tagFilter').addEventListener('change', filterFiles);
      
      // 初始化展示模式
      setViewMode(viewMode);
      
      // 初始化暗色模式
      if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        document.querySelector('.dark-toggle').textContent = '☀️';
      }
    });
    
    // 加载统计数据
    async function loadStats() {
      try {
        const res = await fetch(`${API_BASE}/api/files/stats`);
        const data = await res.json();
        
        if (data.success) {
          document.getElementById('totalFiles').textContent = data.data.total;
          
          const byType = data.data.byType;
          document.getElementById('mediaCount').textContent = byType.find(t => t.file_type === 'media')?.count || 0;
          document.getElementById('docCount').textContent = byType.find(t => t.file_type === 'document')?.count || 0;
          document.getElementById('htmlCount').textContent = byType.find(t => t.file_type === 'html')?.count || 0;
          document.getElementById('imageCount').textContent = byType.find(t => t.file_type === 'image')?.count || 0;
        }
      } catch (err) {
        console.error('加载统计失败:', err);
      }
    }
    
    // 加载文件列表（根据当前模式自动选择接口）
    async function loadFiles() {
      try {
        let url;
        const params = new URLSearchParams();
        params.set('page', String(currentPage));
        params.set('pageSize', String(pageSize));

        if (currentMode === 'search') {
          url = `${API_BASE}/api/search?q=${encodeURIComponent(currentQuery)}&${params}`;
        } else if (currentMode === 'typeFilter') {
          url = `${API_BASE}/api/search?type=${currentQuery}&${params}`;
        } else if (currentMode === 'tagFilter') {
          url = `${API_BASE}/api/search?tag=${currentQuery}&${params}`;
        } else {
          params.set('sortBy', sortBy);
          params.set('sortOrder', sortOrder);
          url = `${API_BASE}/api/files?${params}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        
        if (data.success) {
          allFiles = data.data;
          renderFiles(allFiles);
          updatePagination(data.pagination);
        }
      } catch (err) {
        console.error('加载文件失败:', err);
        showToast('加载文件失败', 'error');
      }
    }
    
    // 更新分页状态
    function updatePagination(pagination) {
      document.getElementById('currentPage').textContent = pagination.page;
      document.getElementById('totalPages').textContent = pagination.totalPages;
      document.getElementById('prevPage').disabled = pagination.page <= 1;
      document.getElementById('nextPage').disabled = pagination.page >= pagination.totalPages;
    }
    
    // 切换页面
    function changePage(delta) {
      currentPage += delta;
      loadFiles();
    }
    
    // 修改每页数量
    function changePageSize() {
      pageSize = parseInt(document.getElementById('pageSize').value);
      currentPage = 1;
      loadFiles();
    }
    
    // 设置展示模式
    function setViewMode(mode) {
      viewMode = mode;
      localStorage.setItem('viewMode', mode);
      
      const container = document.getElementById('filesContainer');
      container.classList.toggle('list-view', mode === 'list');
      
      document.getElementById('gridViewBtn').classList.toggle('active', mode === 'grid');
      document.getElementById('listViewBtn').classList.toggle('active', mode === 'list');
    }
    
    // 设置排序
    function setSort() {
      sortBy = document.getElementById('sortBy').value;
      sortOrder = document.getElementById('sortOrder').value;
      localStorage.setItem('sortBy', sortBy);
      localStorage.setItem('sortOrder', sortOrder);
      currentPage = 1;
      loadFiles();
    }
    
    // 切换页面
    function switchTab(tab) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      
      document.getElementById(tab + 'Page').classList.add('active');
      const tabBtn = document.querySelector(`[onclick="switchTab('${tab}')"]`);
      if (tabBtn) tabBtn.classList.add('active');
      
      if (tab === 'stats') {
        loadStatsData();
      } else if (tab === 'recent') {
        loadRecentFiles();
      } else if (tab === 'duplicates') {
        loadDuplicateFiles();
      }
    }
    
    // 加载统计数据
    async function loadStatsData() {
      try {
        const res = await fetch(`${API_BASE}/api/stats/overall`);
        const data = await res.json();
        
        if (data.success) {
          document.getElementById('totalClicks').textContent = data.data.totalClicks;
          document.getElementById('totalPlays').textContent = data.data.totalPlays;
          document.getElementById('todayClicks').textContent = data.data.todayClicks;
          document.getElementById('todayPlays').textContent = data.data.todayPlays;
          
          renderTopFiles(data.data.topFiles);
          renderTypeStats(data.data.typeStats);
        }
      } catch (err) {
        console.error('加载统计失败:', err);
        showToast('加载统计数据失败', 'error');
      }
    }
    
    // 渲染热门文件
    function renderTopFiles(files) {
      const container = document.getElementById('topFiles');
      
      if (!files || files.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">暂无数据</p>';
        return;
      }
      
      container.innerHTML = files.map((file, index) => `
        <div class="top-file-item" onclick="showFileDetail(${file.id})">
          <span class="rank">${index + 1}</span>
          <span class="icon">${getFileIcon(file.file_type, file.file_extension)}</span>
          <span class="name">${file.filename}</span>
          <span class="stats">点击 ${file.clicks || 0} · 播放 ${file.plays || 0}</span>
        </div>
      `).join('');
    }
    
    // 渲染类型统计
    function renderTypeStats(typeStats) {
      const container = document.getElementById('typeStats');
      
      if (!typeStats || typeStats.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">暂无数据</p>';
        return;
      }
      
      container.innerHTML = typeStats.map(stat => `
        <div class="type-stat-item">
          <div class="type-name">${getTypeName(stat.file_type)}</div>
          <div class="type-value">点击 ${stat.clicks || 0}</div>
          <div class="type-value">播放 ${stat.plays || 0}</div>
        </div>
      `).join('');
    }
    
    // 获取类型名称
    function getTypeName(type) {
      const names = {
        media: '媒体文件',
        image: '图片文件',
        document: '文档文件',
        html: 'HTML文件'
      };
      return names[type] || type;
    }
    
    // 记录点击
    async function recordClick(fileId) {
      try {
        await fetch(`${API_BASE}/api/stats/record`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId, actionType: 'click' })
        });
      } catch (err) {
        console.error('记录点击失败:', err);
      }
    }
    
    // 记录播放
    async function recordPlay(fileId) {
      try {
        await fetch(`${API_BASE}/api/stats/record`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId, actionType: 'play' })
        });
      } catch (err) {
        console.error('记录播放失败:', err);
      }
    }
    
    // 加载标签
    async function loadTags() {
      try {
        const res = await fetch(`${API_BASE}/api/search/tags`);
        const data = await res.json();
        
        if (data.success) {
          allTags = data.data;
          const select = document.getElementById('tagFilter');
          select.innerHTML = '<option value="">所有标签</option>';
          allTags.forEach(tag => {
            select.innerHTML += `<option value="${tag.name}">${tag.name} (${tag.tag_type})</option>`;
          });
        }
      } catch (err) {
        console.error('加载标签失败:', err);
      }
    }
    
    // 搜索文件
    function searchFiles(keyword) {
      if (keyword) {
        currentMode = 'search';
        currentQuery = keyword;
      } else {
        currentMode = 'browse';
        currentQuery = '';
      }
      currentPage = 1;
      loadFiles();
    }
    
    // 筛选文件
    function filterFiles() {
      const type = document.getElementById('typeFilter').value;
      const tag = document.getElementById('tagFilter').value;
      
      if (tag) {
        currentMode = 'tagFilter';
        currentQuery = tag;
      } else if (type) {
        currentMode = 'typeFilter';
        currentQuery = type;
      } else {
        currentMode = 'browse';
        currentQuery = '';
      }
      currentPage = 1;
      loadFiles();
    }
    
    // 渲染文件列表
    function renderFiles(files) {
      const container = document.getElementById('filesContainer');
      
      if (files.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="grid-column: 1/-1;">
            <div class="icon">📂</div>
            <h3>暂无文件</h3>
            <p>点击"扫描文件"按钮导入你的文件</p>
          </div>
        `;
        return;
      }
      
      container.innerHTML = files.map(file => {
        const icon = getFileIcon(file.file_type, file.file_extension);
        const size = formatSize(file.file_size);
        const tags = JSON.parse(file.folder_hierarchy || '[]');
        const date = new Date(file.scanned_at).toLocaleDateString('zh-CN');
        const isBookmarked = bookmarkedIds.has(file.id);
        const isSelected = selectedIds.has(file.id);
        
        return `
          <div class="file-card ${isSelected ? 'selected' : ''}">
            <div class="card-top">
              <div style="display:flex;align-items:center;flex:1;min-width:0;cursor:pointer;" onclick="showFileDetail(${file.id})">
                <input type="checkbox" class="card-check" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation();toggleSelect(${file.id})">
                <div class="icon type-${file.file_type}">${icon}</div>
              </div>
              <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" onclick="event.stopPropagation();toggleBookmark(${file.id}, this)" title="书签">${isBookmarked ? '⭐' : '☆'}</button>
            </div>
            <div style="cursor:pointer;" onclick="showFileDetail(${file.id})">
              <div class="name">${file.filename}</div>
              <div class="meta">${size} · ${date}</div>
              <div class="tags">
                <span class="tag">${file.file_type}</span>
                ${tags.map(t => `<span class="tag">${t}</span>`).join('')}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
    
    // 获取文件图标
    function getFileIcon(type, ext) {
      if (type === 'media') {
        if (['mp4', 'avi', 'mkv', 'mov'].includes(ext)) return '🎬';
        if (['mp3', 'ogg', 'wav', 'flac'].includes(ext)) return '🎵';
        return '🎥';
      }
      if (type === 'image') return '🖼️';
      if (type === 'document') {
        if (ext === 'pdf') return '📄';
        if (ext === 'txt') return '📝';
        return '📃';
      }
      if (type === 'html') return '🌐';
      return '📎';
    }
    
    // 格式化文件大小
    function formatSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // 显示文件详情（改为打开预览）
    async function showFileDetail(id) {
      try {
        recordClick(id);  // 记录点击
        
        const res = await fetch(`${API_BASE}/api/files/${id}`);
        const data = await res.json();

        if (data.success) {
          openPreview(data.data);
        }
      } catch (err) {
        showToast('获取文件信息失败', 'error');
      }
    }

    // 打开预览模态窗口
    async function openPreview(file) {
      const modal = document.getElementById('previewModal');
      const title = document.getElementById('previewTitle');
      const body = document.getElementById('previewBody');
      const downloadBtn = document.getElementById('previewDownloadBtn');

      title.textContent = file.filename;
      downloadBtn.href = `${API_BASE}/api/files/${file.id}/download`;

      // 显示加载中
      body.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
      modal.classList.add('active');

      // 根据文件类型加载预览
      const previewUrl = `${API_BASE}/api/files/${file.id}/preview`;

      if (file.file_type === 'media') {
        const videoFormats = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'];
        const audioFormats = ['mp3', 'ogg', 'wav', 'flac', 'aac', 'wma', 'm4a'];

        if (videoFormats.includes(file.file_extension)) {
          body.innerHTML = createVideoPlayer(previewUrl, file.id);
        } else if (audioFormats.includes(file.file_extension)) {
          body.innerHTML = createAudioPlayer(previewUrl, file.filename, file.id);
        } else {
          body.innerHTML = '<p style="color: #888;">暂不支持预览此媒体格式</p>';
        }
      } else if (file.file_type === 'document') {
        if (file.file_extension === 'pdf') {
          body.innerHTML = createPDFViewer(previewUrl);
        } else if (file.file_extension === 'txt') {
          body.innerHTML = await createTextViewer(previewUrl);
        } else {
          body.innerHTML = '<p style="color: #888;">暂不支持预览此文档格式</p>';
        }
      } else if (file.file_type === 'image') {
        body.innerHTML = `<img src="${previewUrl}" style="max-width: 100%; max-height: 70vh; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" alt="${file.filename}">`;
      } else {
        body.innerHTML = '<p style="color: #888;">暂不支持预览此文件类型</p>';
      }
    }

    // 文本阅读器
    async function createTextViewer(fileUrl) {
      try {
        const response = await fetch(fileUrl);
        const text = await response.text();
        const escapedText = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        return `
          <pre class="text-content">${escapedText}</pre>
        `;
      } catch (error) {
        return '<p style="color: #ff6b6b;">加载文本失败</p>';
      }
    }

    // PDF阅读器
    function createPDFViewer(fileUrl) {
      return `
        <iframe
          src="${fileUrl}"
          style="width: 100%; height: 70vh; border: none; background: white;"
          title="PDF预览">
        </iframe>
      `;
    }

    // 音频播放器
    function createAudioPlayer(fileUrl, fileName, fileId) {
      return `
        <div class="audio-player">
          <div class="audio-icon">🎵</div>
          <div class="audio-info">
            <div class="audio-name">${fileName}</div>
            <div class="audio-hint">音频文件</div>
          </div>
          <audio controls autoplay 
                 onplay="recordPlay(${fileId})"
                 style="width: 100%; margin-top: 20px;">
            <source src="${fileUrl}">
            您的浏览器不支持音频播放
          </audio>
        </div>
      `;
    }

    // 视频播放器
    function createVideoPlayer(fileUrl, fileId) {
      return `
        <video id="previewVideo" controls autoplay 
               onplay="recordPlay(${fileId})"
               style="max-width: 100%; max-height: 70vh;">
          <source src="${fileUrl}">
          您的浏览器不支持视频播放
        </video>
      `;
    }

    // 关闭预览模态窗口
    function closePreview() {
      const modal = document.getElementById('previewModal');
      const body = document.getElementById('previewBody');

      // 停止媒体播放
      const video = body.querySelector('video');
      const audio = body.querySelector('audio');
      if (video) video.pause();
      if (audio) audio.pause();

      // 清空内容并关闭
      body.innerHTML = '';
      modal.classList.remove('active');
    }

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      switch (e.key) {
        case 'Escape':
          closePreview();
          closeScanModal();
          break;
        case 'f':
          e.preventDefault();
          document.getElementById('searchInput').focus();
          break;
        case 'n':
          document.getElementById('nextPage')?.click();
          break;
        case 'p':
          document.getElementById('prevPage')?.click();
          break;
        case 'g':
          setViewMode('grid');
          break;
        case 'l':
          setViewMode('list');
          break;
        case 's':
          switchTab('stats');
          break;
        case 'b':
          switchTab('files');
          break;
      }
    });

    // 点击背景关闭预览
    document.getElementById('previewModal').addEventListener('click', (e) => {
      if (e.target.id === 'previewModal') {
        closePreview();
      }
    });

    // 触摸设备优化
    function initTouchOptimizations() {
      // 检测触摸设备
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      if (isTouchDevice) {
        // 为模态窗口添加滑动关闭支持
        addSwipeToClose();
        
        // 改进触摸反馈
        addTouchFeedback();
        
        // 优化导航标签滚动
        optimizeNavScroll();
      }
    }

    // 添加滑动关闭功能
    function addSwipeToClose() {
      let startY = 0;
      let startX = 0;
      const threshold = 50; // 滑动阈值
      
      const previewModal = document.getElementById('previewModal');
      const scanModal = document.getElementById('scanModal');
      
      [previewModal, scanModal].forEach(modal => {
        if (!modal) return;
        
        modal.addEventListener('touchstart', (e) => {
          startY = e.touches[0].clientY;
          startX = e.touches[0].clientX;
        }, { passive: true });
        
        modal.addEventListener('touchend', (e) => {
          if (!startY || !startX) return;
          
          const endY = e.changedTouches[0].clientY;
          const endX = e.changedTouches[0].clientX;
          const diffY = endY - startY;
          const diffX = endX - startX;
          
          // 检测向下滑动（垂直距离大于水平距离，且向下滑动超过阈值）
          if (Math.abs(diffY) > Math.abs(diffX) && diffY > threshold) {
            // 检查是否从内容区域开始滑动
            const target = e.target;
            if (target.closest('.modal-content') || target.closest('.preview-content')) {
              if (modal === previewModal) {
                closePreview();
              } else if (modal === scanModal) {
                closeScanModal();
              }
            }
          }
          
          startY = 0;
          startX = 0;
        }, { passive: true });
      });
    }

    // 添加触摸反馈
    function addTouchFeedback() {
      // 为按钮和可点击元素添加触摸反馈
      const interactiveElements = document.querySelectorAll('.btn, .nav-tab, .file-card, .top-file-item, .tag-filter .tag');
      
      interactiveElements.forEach(el => {
        el.addEventListener('touchstart', function() {
          this.style.transform = 'scale(0.98)';
          this.style.opacity = '0.9';
        }, { passive: true });
        
        el.addEventListener('touchend', function() {
          this.style.transform = '';
          this.style.opacity = '';
        }, { passive: true });
        
        el.addEventListener('touchcancel', function() {
          this.style.transform = '';
          this.style.opacity = '';
        }, { passive: true });
      });
    }

    // 优化导航标签滚动
    function optimizeNavScroll() {
      const navTabs = document.querySelector('.nav-tabs');
      if (!navTabs) return;
      
      let isScrolling = false;
      let startX = 0;
      let scrollLeft = 0;
      
      navTabs.addEventListener('touchstart', (e) => {
        isScrolling = true;
        startX = e.touches[0].pageX - navTabs.offsetLeft;
        scrollLeft = navTabs.scrollLeft;
      }, { passive: true });
      
      navTabs.addEventListener('touchmove', (e) => {
        if (!isScrolling) return;
        const x = e.touches[0].pageX - navTabs.offsetLeft;
        const walk = (x - startX) * 2; // 滚动速度
        navTabs.scrollLeft = scrollLeft - walk;
      }, { passive: true });
      
      navTabs.addEventListener('touchend', () => {
        isScrolling = false;
      }, { passive: true });
      
      // 隐藏滚动条但保持可滚动
      navTabs.style.scrollbarWidth = 'none';
      navTabs.style.msOverflowStyle = 'none';
    }

    // 页面加载完成后初始化触摸优化
    document.addEventListener('DOMContentLoaded', () => {
      initTouchOptimizations();
    });
    
    // 打开扫描弹窗
    function openScanModal() {
      document.getElementById('scanModal').classList.add('active');
      document.getElementById('scanPath').focus();
    }
    
    // 关闭扫描弹窗
    function closeScanModal() {
      document.getElementById('scanModal').classList.remove('active');
      document.getElementById('scanProgress').style.display = 'none';
    }
    
    // 开始扫描
    async function startScan() {
      const path = document.getElementById('scanPath').value.trim();
      
      if (!path) {
        showToast('请输入文件目录路径', 'error');
        return;
      }
      
      const btn = document.getElementById('scanBtn');
      const progress = document.getElementById('scanProgress');
      const status = document.getElementById('scanStatus');
      
      btn.disabled = true;
      progress.style.display = 'block';
      status.textContent = '扫描中...';
      
      try {
        const res = await fetch(`${API_BASE}/api/scan/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rootPath: path, scanType: 'full' })
        });
        
        const data = await res.json();
        
        if (data.success) {
          status.textContent = `扫描完成! 发现 ${data.data.totalFiles} 个文件，新增 ${data.data.addedFiles} 个`;
          showToast(`扫描成功! 新增 ${data.data.addedFiles} 个文件`, 'success');
          
          // 刷新数据
          setTimeout(() => {
            closeScanModal();
            refreshFiles();
          }, 1500);
        } else {
          status.textContent = '扫描失败: ' + data.message;
          showToast('扫描失败', 'error');
        }
      } catch (err) {
        status.textContent = '扫描失败: ' + err.message;
        showToast('扫描失败', 'error');
      } finally {
        btn.disabled = false;
      }
    }
    
    // 刷新文件列表
    function refreshFiles() {
      loadStats();
      loadFiles();
      loadTags();
      showToast('已刷新', 'success');
    }
    
    // 显示Toast通知
    function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.className = `toast ${type} show`;
      toast.style.display = 'block';
      
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3000);
    }

    // ===== MVP2 新功能 =====

    // 暗色模式
    function toggleDarkMode() {
      const isDark = document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', isDark);
      document.querySelector('.dark-toggle').textContent = isDark ? '☀️' : '🌙';
    }

    // 加载书签
    async function loadBookmarked() {
      try {
        const res = await fetch(`${API_BASE}/api/files/bookmarked`);
        const data = await res.json();
        if (data.success) {
          bookmarkedIds = new Set(data.data.map(f => f.id));
        }
      } catch (err) {
        console.error('加载书签失败:', err);
      }
    }

    // 切换书签
    async function toggleBookmark(fileId, btn) {
      try {
        const res = await fetch(`${API_BASE}/api/files/${fileId}/bookmark`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          if (data.data.bookmarked) {
            bookmarkedIds.add(fileId);
            btn.textContent = '⭐';
            btn.classList.add('active');
          } else {
            bookmarkedIds.delete(fileId);
            btn.textContent = '☆';
            btn.classList.remove('active');
          }
        }
      } catch (err) {
        console.error('切换书签失败:', err);
      }
    }

    // 文件夹侧栏
    let folderSidebarVisible = false;

    function toggleFolderSidebar() {
      folderSidebarVisible = !folderSidebarVisible;
      document.getElementById('folderSidebar').classList.toggle('show', folderSidebarVisible);
      if (folderSidebarVisible) loadFolderTree();
    }

    async function loadFolderTree() {
      const container = document.getElementById('folderTree');
      try {
        const res = await fetch(`${API_BASE}/api/files/folders`);
        const data = await res.json();
        if (data.success) {
          container.innerHTML = buildFolderTreeHTML(data.data);
        }
      } catch (err) {
        container.innerHTML = '<p style="color:var(--text-secondary);">加载失败</p>';
      }
    }

    function buildFolderTreeHTML(tree) {
      if (!tree || tree.length === 0) return '<p style="color:var(--text-secondary);font-size:13px;">暂无文件夹</p>';
      return tree.map(node => `
        <div>
          <div class="folder-item" onclick="selectFolder('${node.path}', this)">
            ${node.children.length > 0 ? `<span class="arrow" onclick="event.stopPropagation();toggleFolderExpand(this)">▶</span>` : '<span style="width:14px"></span>'}
            📁 ${node.name}
          </div>
          ${node.children.length > 0 ? `<div class="folder-children hidden">${buildFolderTreeHTML(node.children)}</div>` : ''}
        </div>
      `).join('');
    }

    function toggleFolderExpand(arrow) {
      arrow.classList.toggle('expanded');
      const children = arrow.parentElement.parentElement.querySelector('.folder-children');
      if (children) children.classList.toggle('hidden');
    }

    function selectFolder(path, el) {
      document.querySelectorAll('.folder-item').forEach(e => e.classList.remove('active'));
      el.classList.add('active');
      currentMode = 'browse';
      currentQuery = '';
      fetchFilesByFolder(path);
    }

    async function fetchFilesByFolder(path) {
      try {
        const res = await fetch(`${API_BASE}/api/files/folder?path=${encodeURIComponent(path)}&page=${currentPage}&pageSize=${pageSize}`);
        const data = await res.json();
        if (data.success) {
          allFiles = data.data;
          renderFiles(allFiles);
          updatePagination(data.pagination);
        }
      } catch (err) {
        showToast('加载文件夹文件失败', 'error');
      }
    }

    // 批量选择
    function toggleSelect(fileId) {
      if (selectedIds.has(fileId)) {
        selectedIds.delete(fileId);
      } else {
        selectedIds.add(fileId);
      }
      updateBatchBar();
      renderFiles(allFiles);
    }

    function clearSelection() {
      selectedIds.clear();
      updateBatchBar();
      renderFiles(allFiles);
    }

    function updateBatchBar() {
      const bar = document.getElementById('batchBar');
      const count = document.getElementById('selectedCount');
      count.textContent = selectedIds.size;
      bar.classList.toggle('show', selectedIds.size > 0);
    }

    async function batchDelete() {
      const ids = Array.from(selectedIds);
      if (ids.length === 0) return;
      if (!confirm(`确定要删除 ${ids.length} 个文件记录吗？`)) return;

      try {
        const res = await fetch(`${API_BASE}/api/files/batch-delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          clearSelection();
          loadStats();
          loadFiles();
        }
      } catch (err) {
        showToast('批量删除失败', 'error');
      }
    }

    // 最近文件
    async function loadRecentFiles() {
      const container = document.getElementById('recentFiles');
      try {
        const res = await fetch(`${API_BASE}/api/files/recent?days=7`);
        const data = await res.json();
        if (data.success) {
          if (data.data.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="icon">🕐</div><p>最近 7 天没有新增文件</p></div>';
            return;
          }
          container.innerHTML = data.data.map(file => `
            <div class="recent-item" onclick="showFileDetail(${file.id})">
              <div style="font-size:24px;margin-bottom:5px;">${getFileIcon(file.file_type, file.file_extension)}</div>
              <div style="font-weight:600;font-size:14px;word-break:break-all;">${file.filename}</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">
                ${formatSize(file.file_size)} · ${new Date(file.scanned_at).toLocaleDateString('zh-CN')}
              </div>
            </div>
          `).join('');
        }
      } catch (err) {
        container.innerHTML = '<p style="color:var(--text-secondary);">加载失败</p>';
      }
    }

    // 重复文件
    async function loadDuplicateFiles() {
      const container = document.getElementById('duplicateFiles');
      try {
        const res = await fetch(`${API_BASE}/api/files/duplicates`);
        const data = await res.json();
        if (data.success) {
          if (data.data.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="icon">✅</div><p>未发现重复文件</p></div>';
            return;
          }
          container.innerHTML = data.data.map(group => {
            const paths = group.paths.split('|||');
            const ids = group.ids.split(',');
            return `
              <div class="dup-group">
                <h4>📄 ${group.filename}</h4>
                <div class="dup-meta">大小: ${formatSize(group.file_size)} · 重复 ${group.count} 份</div>
                ${paths.map((p, i) => `
                  <div class="dup-file" onclick="showFileDetail(${ids[i]})">📎 ${p}</div>
                `).join('')}
              </div>
            `;
          }).join('');
        }
      } catch (err) {
        container.innerHTML = '<p style="color:var(--text-secondary);">加载失败</p>';
      }
    }
  