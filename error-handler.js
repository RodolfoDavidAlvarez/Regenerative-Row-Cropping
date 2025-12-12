// Enhanced error handling for PDF export
(function() {
    'use strict';

    // Error logging utility
    const ErrorLogger = {
        log: function(error, context) {
            const errorData = {
                timestamp: new Date().toISOString(),
                error: error.message || error,
                stack: error.stack,
                context: context || {},
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            console.error('PDF Export Error:', errorData);

            // Send to server if available
            if (typeof fetch !== 'undefined') {
                fetch('/api/log-error', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(errorData)
                }).catch(err => console.warn('Failed to log error to server:', err));
            }
        }
    };

    // Lazy loader for external scripts if CDN fails to load in time
    const ScriptLoader = (() => {
        const cache = new Map();
        const loadScript = (src) => {
            if (cache.has(src)) {
                return cache.get(src);
            }
            const promise = new Promise((resolve, reject) => {
                const el = document.createElement('script');
                el.src = src;
                el.async = true;
                el.onload = () => resolve();
                el.onerror = () => reject(new Error(`Failed to load script: ${src}`));
                document.head.appendChild(el);
            });
            cache.set(src, promise);
            return promise;
        };
        return {
            loadScript
        };
    })();

    // Enhanced PDF export with proper margins and high quality
    window.enhancedPDFExport = async function() {
        const btn = document.querySelector('.pdf-export-btn');
        if (!btn) {
            console.error('Export button not found');
            return;
        }

        const originalHTML = btn.innerHTML;

        btn.classList.add('exporting');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
        btn.disabled = true;

        // Preload images to avoid blank placeholders
        const waitForImage = (img) => {
            if (img.complete && img.naturalWidth > 0) {
                return Promise.resolve();
            }
            return new Promise((resolve) => {
                const done = () => resolve();
                img.onload = done;
                img.onerror = done;
                setTimeout(done, 3000);
            });
        };

        const ensureLibraries = async () => {
            if (!window.html2canvas) {
                await ScriptLoader.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
            }
            if (!window.jspdf || !window.jspdf.jsPDF) {
                await ScriptLoader.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            }
            if (!window.html2canvas) {
                throw new Error('html2canvas is not available on the page');
            }
        };

        let exportBtn;
        let sidebarNav;
        let originalStyles = {};
        let pages = [];
        let pageStyleCache = [];
        let element;

        const restoreStyles = () => {
            if (pages.length && pageStyleCache.length) {
                pages.forEach((page, index) => {
                    if (pageStyleCache[index]) {
                        page.style.boxShadow = pageStyleCache[index].boxShadow || '';
                        page.style.overflow = pageStyleCache[index].overflow || '';
                        page.style.height = pageStyleCache[index].height || '';
                        page.style.minHeight = pageStyleCache[index].minHeight || '';
                        page.style.maxHeight = pageStyleCache[index].maxHeight || '';
                        page.style.padding = pageStyleCache[index].padding || '';
                        page.style.margin = pageStyleCache[index].margin || '';
                        page.style.width = pageStyleCache[index].width || '';
                    }
                });
            }

            if (exportBtn) exportBtn.style.display = originalStyles.btnDisplay;
            if (sidebarNav) sidebarNav.style.display = originalStyles.sidebarDisplay;
            if (typeof originalStyles.bodyBg !== 'undefined') {
                document.body.style.background = originalStyles.bodyBg;
            }
            if (typeof originalStyles.bodyPaddingLeft !== 'undefined') {
                document.body.style.paddingLeft = originalStyles.bodyPaddingLeft;
            }
        };

        try {
            await ensureLibraries();

            element = document.getElementById('document-content');

            if (!element) {
                throw new Error('Document content element not found');
            }

            // Validate element has content
            if (element.offsetHeight === 0 || element.offsetWidth === 0) {
                throw new Error('Document content has no dimensions');
            }

            // Wait for images to load
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading images...';
            await Promise.all(Array.from(document.querySelectorAll('img')).map(waitForImage));

            // Small delay to ensure all content is fully rendered
            await new Promise(resolve => setTimeout(resolve, 500));

            // Keep everything in view for consistent rendering
            window.scrollTo(0, 0);
            element.scrollIntoView({ behavior: 'instant', block: 'start' });

            // Hide UI elements
            exportBtn = document.querySelector('.pdf-export-btn');
            sidebarNav = document.querySelector('.sidebar-nav');
            originalStyles = {
                btnDisplay: exportBtn ? exportBtn.style.display : '',
                sidebarDisplay: sidebarNav ? sidebarNav.style.display : '',
                bodyBg: document.body.style.background,
                bodyPaddingLeft: document.body.style.paddingLeft
            };

            if (exportBtn) exportBtn.style.display = 'none';
            if (sidebarNav) sidebarNav.style.display = 'none';

            // Adjust body padding when sidebar is hidden
            document.body.style.paddingLeft = '0';

            // Set white background for PDF
            document.body.style.background = '#ffffff';

            // Force reflow
            void element.offsetHeight;

            // Collect pages exactly as rendered
            pages = Array.from(element.querySelectorAll('.page'));
            if (!pages.length) {
                throw new Error('No pages found for export');
            }

            // Cache original styles
            pageStyleCache = pages.map((page) => ({
                boxShadow: page.style.boxShadow,
                overflow: page.style.overflow,
                height: page.style.height,
                minHeight: page.style.minHeight,
                maxHeight: page.style.maxHeight,
                padding: page.style.padding,
                margin: page.style.margin,
                width: page.style.width
            }));

            // Set each page to exact letter size dimensions for PDF
            // Letter size: 8.5in x 11in = 816px x 1056px at 96dpi
            const pageWidthPx = 816;
            const pageHeightPx = 1056;

            pages.forEach((page) => {
                page.style.boxShadow = 'none';
                page.style.overflow = 'hidden';
                page.style.width = pageWidthPx + 'px';
                page.style.height = pageHeightPx + 'px';
                page.style.minHeight = pageHeightPx + 'px';
                page.style.maxHeight = pageHeightPx + 'px';
                page.style.margin = '0';
                // Proper margins: 0.5in top, 0.5in sides, 0.75in bottom for page number
                page.style.padding = '48px 48px 72px 48px';
            });

            // Force reflow after style changes
            await new Promise(resolve => setTimeout(resolve, 200));

            // Create PDF with letter size
            const jsPDF = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
            if (!jsPDF) throw new Error('jsPDF not available');

            // Letter size in points: 612 x 792
            const pdf = new jsPDF({
                unit: 'pt',
                format: 'letter',
                orientation: 'portrait',
                compress: true,
                putOnlyUsedFonts: true
            });

            const pdfWidth = 612;   // points
            const pdfHeight = 792;  // points

            // Higher scale for better quality (3x for print quality)
            const scale = 3;

            for (let i = 0; i < pages.length; i++) {
                btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Page ${i + 1}/${pages.length}`;

                // Scroll page into view
                pages[i].scrollIntoView({ behavior: 'instant', block: 'start' });
                await new Promise(resolve => setTimeout(resolve, 150));

                // Capture with high quality settings
                const canvas = await html2canvas(pages[i], {
                    scale: scale,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    logging: false,
                    letterRendering: true,
                    scrollX: 0,
                    scrollY: -window.scrollY,
                    windowWidth: pageWidthPx,
                    windowHeight: pageHeightPx,
                    width: pageWidthPx,
                    height: pageHeightPx
                });

                // Convert to high quality PNG for better text rendering
                const imgData = canvas.toDataURL('image/png', 1.0);

                // Add new page if not first
                if (i > 0) {
                    pdf.addPage('letter', 'portrait');
                }

                // Add image to fill the entire page (no extra margins in PDF)
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            }

            btn.innerHTML = '<i class="fas fa-download"></i> Downloading...';

            // Save with descriptive filename
            pdf.save('Regenerative-Field-Trial-Proposal-Caroline-Kramer.pdf');

            restoreStyles();
            btn.classList.remove('exporting');
            btn.innerHTML = '<i class="fas fa-check"></i> Done!';
            btn.disabled = false;
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 2000);
        } catch (error) {
            ErrorLogger.log(error, {
                phase: 'pdf-export',
                pageCount: pages.length,
                elementDimensions: element ? {
                    width: element.offsetWidth,
                    height: element.offsetHeight,
                    scrollWidth: element.scrollWidth,
                    scrollHeight: element.scrollHeight
                } : null
            });
            restoreStyles();
            btn.classList.remove('exporting');
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed';
            btn.disabled = false;
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 3000);
        }
    };

    // Export error logger for global access
    window.ErrorLogger = ErrorLogger;
})();
