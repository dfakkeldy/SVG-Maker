const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadContent = document.getElementById('upload-content');
const originalPreview = document.getElementById('original-preview');
const resultPlaceholder = document.getElementById('result-placeholder');
const svgContainer = document.getElementById('svg-container');
const loader = document.getElementById('loader');
const btnExport = document.getElementById('btn-export');
const btnReset = document.getElementById('btn-reset');

let currentImageDataUrl = null;
let currentSvgString = null;

// Settings elements
const presetSelect = document.getElementById('preset-select');
const numberofcolors = document.getElementById('numberofcolors');
const mincolorratio = document.getElementById('mincolorratio');
const colorquantcycles = document.getElementById('colorquantcycles');
const blurradius = document.getElementById('blurradius');
const blurdelta = document.getElementById('blurdelta');
const strokewidth = document.getElementById('strokewidth');
const linefilter = document.getElementById('linefilter');
const scale = document.getElementById('scale');
const viewbox = document.getElementById('viewbox');
const keepwhite = document.getElementById('keepwhite');
const whitethreshold = document.getElementById('whitethreshold');
const whitethresholdGroup = document.getElementById('white-threshold-group');
const despeckle = document.getElementById('despeckle');
const desc = document.getElementById('desc');
const qspline = document.getElementById('qspline');
const rightangleenhance = document.getElementById('rightangleenhance');

// Value display elements
const numberofcolorsVal = document.getElementById('numberofcolors-val');
const mincolorratioVal = document.getElementById('mincolorratio-val');
const colorquantcyclesVal = document.getElementById('colorquantcycles-val');
const blurradiusVal = document.getElementById('blurradius-val');
const blurdeltaVal = document.getElementById('blurdelta-val');
const strokewidthVal = document.getElementById('strokewidth-val');
const scaleVal = document.getElementById('scale-val');
const whitethresholdVal = document.getElementById('whitethreshold-val');
const despeckleVal = document.getElementById('despeckle-val');

// Event Listeners for UI
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        alert('Please upload a PNG or JPEG image.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageDataUrl = e.target.result;
        originalPreview.src = currentImageDataUrl;
        originalPreview.classList.remove('hidden');
        uploadContent.classList.add('hidden');
        btnReset.disabled = false;
        
        processImage();
    };
    reader.readAsDataURL(file);
}

// Option change listeners
const inputs = [
    presetSelect, numberofcolors, mincolorratio, colorquantcycles,
    blurradius, blurdelta, strokewidth, linefilter, scale,
    viewbox, keepwhite, whitethreshold, despeckle, desc, qspline, rightangleenhance
];

inputs.forEach(input => {
    input.addEventListener('change', () => {
        updateVals();
        if (input === keepwhite) {
            whitethresholdGroup.style.display = keepwhite.checked ? 'flex' : 'none';
        }
        if (currentImageDataUrl) {
            processImage();
        }
    });
});

// For ranges, update label on input (drag) but don't process yet
[numberofcolors, mincolorratio, colorquantcycles, blurradius, blurdelta, strokewidth, scale, whitethreshold, despeckle].forEach(input => {
    input.addEventListener('input', updateVals);
});

function updateVals() {
    numberofcolorsVal.textContent = numberofcolors.value;
    mincolorratioVal.textContent = mincolorratio.value;
    colorquantcyclesVal.textContent = colorquantcycles.value;
    blurradiusVal.textContent = blurradius.value;
    blurdeltaVal.textContent = blurdelta.value;
    strokewidthVal.textContent = strokewidth.value;
    scaleVal.textContent = scale.value;
    whitethresholdVal.textContent = whitethreshold.value;
    despeckleVal.textContent = despeckle.value;
}

function getOptions() {
    // Note: If preset is not 'default', ImageTracer overrides other settings based on preset unless we explicitly map them.
    // However, if we pass preset along with custom options, the library usually merges them.
    let opts = {
        numberofcolors: parseInt(numberofcolors.value),
        mincolorratio: parseFloat(mincolorratio.value),
        colorquantcycles: parseInt(colorquantcycles.value),
        blurradius: parseFloat(blurradius.value),
        blurdelta: parseInt(blurdelta.value),
        strokewidth: parseFloat(strokewidth.value),
        linefilter: linefilter.checked,
        scale: parseFloat(scale.value),
        viewbox: viewbox.checked,
        desc: desc.checked,
        qspline: qspline.checked,
        rightangleenhance: rightangleenhance.checked
    };
    
    if (presetSelect.value !== 'default') {
        // Applying a preset will overwrite custom settings inside ImageTracer,
        // so we pass preset first, or let ImageTracer handle it via string preset directly.
        // Actually, ImageTracer can take an options object where `pal` or others are set, 
        // or a string name. Let's pass the string if it's purely a preset change.
        opts.preset = presetSelect.value;
    }
    
    return opts;
}

function processImage() {
    if (!currentImageDataUrl || typeof ImageTracer === 'undefined') return;

    loader.classList.remove('hidden');
    resultPlaceholder.classList.add('hidden');
    btnExport.disabled = true;

    const options = getOptions();

    // Use a slight timeout to allow the UI loader to render
    setTimeout(() => {
        ImageTracer.imageToSVG(
            currentImageDataUrl,
            function(svgstr) {
                const despeckleValNum = parseInt(despeckle.value) || 0;
                const shouldFilter = keepwhite.checked || despeckleValNum > 0;

                // Post-process SVG
                if (shouldFilter) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(svgstr, "image/svg+xml");
                    const paths = Array.from(doc.querySelectorAll('path, rect, circle, polygon, polyline'));
                    const threshold = parseInt(whitethreshold.value) || 180;
                    
                    paths.forEach(p => {
                        let remove = false;
                        
                        // Despeckle filter based on command length
                        const d = p.getAttribute('d');
                        if (despeckleValNum > 0 && d && d.length < despeckleValNum) {
                            remove = true;
                        }

                        // Keep white filter
                        if (!remove && keepwhite.checked) {
                            const fill = p.getAttribute('fill');
                            if (fill && fill.startsWith('rgb(')) {
                                const parts = fill.match(/\d+/g);
                                if (parts && parts.length >= 3) {
                                    const r = parseInt(parts[0]);
                                    const g = parseInt(parts[1]);
                                    const b = parseInt(parts[2]);
                                    const brightness = (r + g + b) / 3;
                                    
                                    // If the color is not sufficiently bright, remove the path
                                    if (brightness < threshold) {
                                        remove = true;
                                    } else {
                                        // Force pure white to eliminate topographic lines and embossing
                                        p.setAttribute('fill', 'rgb(255,255,255)');
                                        p.setAttribute('stroke', 'rgb(255,255,255)');
                                        p.setAttribute('stroke-width', strokewidth.value); // Use slider to expand edges and fill shadow gaps
                                    }
                                }
                            }
                        }

                        if (remove) {
                            p.remove();
                        }
                    });
                    svgstr = new XMLSerializer().serializeToString(doc);
                }

                currentSvgString = svgstr;
                svgContainer.innerHTML = svgstr;
                svgContainer.classList.remove('hidden');
                loader.classList.add('hidden');
                btnExport.disabled = false;
            },
            options
        );
    }, 50);
}

btnExport.addEventListener('click', () => {
    if (!currentSvgString) return;

    const blob = new Blob([currentSvgString], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vectorized-icon.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

btnReset.addEventListener('click', () => {
    presetSelect.value = 'default';
    numberofcolors.value = 16;
    mincolorratio.value = 0;
    colorquantcycles.value = 3;
    blurradius.value = 0;
    blurdelta.value = 20;
    strokewidth.value = 1;
    linefilter.checked = false;
    scale.value = 1;
    viewbox.checked = false;
    keepwhite.checked = false;
    whitethresholdGroup.style.display = 'none';
    whitethreshold.value = 180;
    despeckle.value = 0;
    desc.checked = false;
    qspline.checked = false;
    rightangleenhance.checked = true;
    
    updateVals();
    if (currentImageDataUrl) {
        processImage();
    }
});

// Initialize UI labels
updateVals();
