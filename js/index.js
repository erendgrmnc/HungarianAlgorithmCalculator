let size;
let rows = [];
let occupiedCols = [];
let originalValues = []; // Girilen değerler
let values = []; // Girilen değerlerin klonu
let lines = []; // Çizilen çizgileri tutacak array
let numLines; // Çizilen çizgi sayısı

function resetGlobalValues() {
    rows = [];
    occupiedCols = [];
    originalValues = []; // Girilen değerler
    values = []; // Girilen değerlerin klonu
    lines = []; // Çizilen çizgileri tutacak array
    numLines; // Çizilen çizgi sayısı
}


$(document).ready(function () {
    btnCreateOnClick();
    btnCalculateOnClick();
});

function createMatrix() {
    $('#matrix-table').empty();
    size = $('#size-input').val();

    for (var i = 0; i < size; i++) {
        $('#matrix-table').append('<tr id="row_' + i + '"></tr>');
        for (var j = 0; j < size; j++) {
            $('#row_' + i).append('<td ><input id="' + i + '_' + j + '"class="input-cell" type="number" /> </td>');
        }
    }

    $('#btn-calculate').removeAttr('hidden');
}

function btnCreateOnClick() {
    $('#btn-create').on('click', function () {
        createMatrix();
    })
}

function btnCalculateOnClick() {
    $('#btn-calculate').on('click', function () {
        resetGlobalValues();
        let rowCounter = 0;

        $('#matrix-table tr').each(function () {
            originalValues.push([]);
            for (let item = 0; item < size; item++) {
                originalValues[rowCounter][item] = parseInt($('#' + rowCounter + '_' + item).val());
            }
            rowCounter++;
        });
        Hungarian();
        $('#result-header').removeAttr('hidden');
        $('#result').removeAttr('hidden');
        $('#result').html(getTotal());
    })
}

function Hungarian() {
    for (var i = 0; i < size; i++) {
        values.push([]);
        for (var j = 0; j < size; j++) {
            values[i][j] = originalValues[i][j];
        }
    }

    for (var i = 0; i < size; i++) {
        rows.push([]);
    }

    for (var i = 0; i < size; i++) {
        rows[i] = 0;
    }

    for (var i = 0; i < size; i++) {
        occupiedCols.push([]);
    }

    for (var i = 0; i < size; i++) {

        occupiedCols[i] = 0;

    }
    //Algoritma
    subtractRowMinimal();                // Adım 1
    subtractColMinimal();                // Adım 2
    coverZeros();                        // Adım 3
    while (numLines < values.length) {
        createAdditionalZeros();        // Adım 4 (Duruma bağlı)
        coverZeros();                    // Adım 3 (Duruma bağlı)
    }
    optimization();                        // Optimizasyon
}

function subtractRowMinimal() {
    let rowMinValue = [];
    //Her satır için min değer rowMinValue[] array'i içerisinde saklanır.
    for (var row = 0; row < values.length; row++) {
        rowMinValue[row] = values[row][0];
        for (var col = 1; col < values.length; col++) {
            let first = values[row][col];
            let second = rowMinValue[row];
            if (first < second) {
                rowMinValue[row] = values[row][col];
            }
        }
    }

    //rowMinValue[] array'i kullanılarak her satırdan min değer çıkartılır.
    for (var row = 0; row < values.length; row++) {
        for (var col = 0; col < values.length; col++) {
            values[row][col] -= rowMinValue[row];
        }
    }
}

function subtractColMinimal() {
    let colMinValue = []
    //Her sütun için min değer colMinValue[] array'i içerisinde saklanır.
    for (var col = 0; col < values.length; col++) {
        colMinValue[col] = values[0][col];
        for (var row = 1; row < values.length; row++) {
            if (values[row][col] < colMinValue[col])
                colMinValue[col] = values[row][col];
        }
    }

    //colMinValue[] array'i kullanılarak her sütundan min değer çıkartılır. 
    for (var col = 0; col < values.length; col++) {
        for (var row = 0; row < values.length; row++) {
            values[row][col] -= colMinValue[col];
        }
    }
}


function coverZeros() {
    numLines = 0;
    for (var i = 0; i < size; i++) {
        lines.push([]);
    }

    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            lines[i][j] = 0;
        }
    }
    for (var row = 0; row < values.length; row++) {
        for (var col = 0; col < values.length; col++) {
            if (values[row][col] == 0)
                colorNeighbors(row, col, maxVH(row, col));
        }
    }
}

function maxVH(row, col) {
    var result = 0;
    for (var i = 0; i < values.length; i++) {
        if (values[i][col] == 0)
            result++;
        if (values[row][i] == 0)
            result--;
    }
    return result;
}

function colorNeighbors(row, col, maxVH) {

    //Kontroller yapılıyor
    if (lines.length != 0 && lines[row][col] == 2) // Kesişim noktası üzerinden daha önce 2 kez geçilmişse tekrardan çizme
        return;

    if (lines.length != 0 && maxVH > 0 && lines[row][col] == 1) // Kesişim noktası daha önce dikey olarak çizilmişse tekrardan çizilmesin yoksa satır sayısı artar
        return;

    if (lines.length != 0 && maxVH <= 0 && lines[row][col] == -1) // Kesişim noktası daha önce yatay olarak çizilmişse tekrardan çizilmesin
        return;

    for (var i = 0; i < values.length; i++) {
        if (maxVH > 0) {   //  maxVH pozitif ise dikey çiz
            lines[i][col] = lines[i][col] == -1 || lines[i][col] == 2 ? 2 : 1; //Hücre önceden yatay(-1) olarak çizilmişse ve şu an dikey(1) olarak çizilmesi gerekiyor ise kesişim(2) olur, değer daha önce çizilmemişse ise dikey olarak çizilir.
        }
        else {
            // maxVH negatif veya 0 ise yatay çiz
            lines[row][i] = lines[row][i] == 1 || lines[row][i] == 2 ? 2 : -1; //Hücre önceden dikey(1) olarak çizilmişse ve şu an yatay(1) olarak çizilmesi gerekiyor ise kesişim(2) olur, değer daha önce çizilmemişse ise yatay olarak çizilir.
        }
    }

    // çizilen çizgi sayısını arttır.
    numLines++;
    //		printMatrix(lines); 
}


function createAdditionalZeros() {
    var minUncoveredValue = 0; //İlk değeri 0 olarak atadık

    // Üzeri çizilmemiş hücreler için min değer bulunur
    for (var row = 0; row < values.length; row++) {
        for (var col = 0; col < values.length; col++) {
            if (lines[row][col] == 0 && (values[row][col] < minUncoveredValue || minUncoveredValue == 0))
                minUncoveredValue = values[row][col];
        }
    }

    // Üzeri çizili olmayan elemanlardan min değer çıkartılır, kesişim noktalarına ise min değer eklenir.
    for (var row = 0; row < values.length; row++) {
        for (var col = 0; col < values.length; col++) {
            if (lines[row][col] == 0) // Üzeri çizilmemiş nokta, çıkar
                values[row][col] -= minUncoveredValue;

            else if (lines[row][col] == 2) // Kesişim noktası, ekle
                values[row][col] += minUncoveredValue;
        }
    }
}

function findOptimization(row) {
    if (parseInt(row) == rows.length) // Tüm satırlara bir hücre atanmışsa
        return true;

    for (var col = 0; col < values.length; col++) { // Tüm sütunlar gezilir
        // Geçerli hücre sıfır değerine sahipse ve bulunulan sütun önceki satır(lar) tarafından ayrılmış/kullanılmış ise
        if (parseInt(values[row][col]) == 0 && parseInt(occupiedCols[col]) == 0) {
            rows[row] = col; // Geçerli sütunu ata
            occupiedCols[col] = 1; // Sütunu ayrılmış/kullanılmış olarak işaretle
            if (findOptimization(row + 1)) // Sonraki satırlara farklı sütunlardan hüce ataması yapıldıysa, true
                return true;
            // Sonraki satırlara herhangi bir atama yapılamadıysa geri dön ve önceki satırlar için başka bir sütundan başka bir hücre denensin
            occupiedCols[col] = 0;
        }
    }
    // Geçerli satır için hiçbir hücre atanmamışsa, başka bir sütundan başka bir hücreye atamayı denemek için bir satır geri gitmek üzere false değeri döner
    return false;
}

function optimization() {
    return findOptimization(0);
}


function getResult() {
    return rows;
}


function getTotal() {
    var total = 0;
    for (var row = 0; row < values.length; row++)
        total += parseInt(originalValues[row][parseInt(rows[row])]);
    return total;
}

function printMatrix(matrix) {
    for (var row = 0; row < matrix.length; row++) {
        for (var col = 0; col < matrix.length; col++) {
            console.log(matrix[row][col] + "\t");
        }
        console.log('\n')
    }
    console.log('\n')
}