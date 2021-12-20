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
            $('#row_' + i).append('<td><input id="' + i + '_' + j + '"class="input-cell" type="number" /> </td>');
        }
    }

    $('#btn-calculate').removeAttr('hidden');
}

//Kullanıcıdan girilen değere göre matrisi oluşturan buton.
function btnCreateOnClick() {
    $('#btn-create').on('click', function () {
        createMatrix();
    })
}

//Algoritmanın çalışması sonrasında oluşan sonucu kullanıcıya gösteren buton.
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
        paintSelectedCells();
    })
}

function paintSelectedCells() {
    let rowCounter = 0;
    $('#matrix-table tr').each(function () {
        for (let item = 0; item < size; item++) {
            if (rows[rowCounter] == item) {
                $('#' + rowCounter + '_' + item).css("background-color", "yellow");
            }
        }
        rowCounter++;
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
    //Algoritma adımları
    subtractRowMinimal();                // 1. Adım
    subtractColMinimal();                // 2. Adım
    coverZeros();                        // 3. Adım
    while (numLines < values.length) {
        createAdditionalZeros();        // Duruma bağlı adım
        coverZeros();
    }
    optimization();
}

//Matriste bulunan her satır için o satırdaki en küçük elemanları diziye alan fonksiyon.
function subtractRowMinimal() {
    let rowMinValue = [];
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

    //En küçük değerlerin diğer elemanlardan çıkarılması işlemi.
    for (var row = 0; row < values.length; row++) {
        for (var col = 0; col < values.length; col++) {
            values[row][col] -= rowMinValue[row];
        }
    }

    $('#row-header').removeAttr('hidden');
    for (var i = 0; i < size; i++) {
        $('#row-matrix-table').append('<tr id="new_row_' + i + '"></tr>');
        for (var j = 0; j < size; j++) {
            $('#new_row_' + i).append('<td><input class="input-cell" value="' + values[i][j] + '"/></td>');
        }
    }


}

//Matriste bulunan her sütun için o sütundaki en küçük elemanları diziye alan fonksiyon.
function subtractColMinimal() {
    let colMinValue = []
    for (var col = 0; col < values.length; col++) {
        colMinValue[col] = values[0][col];
        for (var row = 1; row < values.length; row++) {
            if (values[row][col] < colMinValue[col])
                colMinValue[col] = values[row][col];
        }
    }

    //En küçük değerlerin diğer elemanlardan çıkarılması işlemi.
    for (var col = 0; col < values.length; col++) {
        for (var row = 0; row < values.length; row++) {
            values[row][col] -= colMinValue[col];
        }
    }

    $('#col-header').removeAttr('hidden');
    for (var i = 0; i < size; i++) {
        $('#col-matrix-table').append('<tr id="new_col_' + i + '"></tr>');
        for (var j = 0; j < size; j++) {
            $('#new_col_' + i).append('<td><input class="input-cell" value="' + values[i][j] + '"/></td>');
        }
    }
}

//Matris elemanları gezilir ve 0 olan elemanlar için fonksiyon çağrılır.
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


//Matriste oluşan sıfırlar kapanacak şekilde çizgiler çizilir.
//Sütun ve satırda ne kadar 0 bulunduğu kontrol edilir.
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

//Komşuların üzerinin çizilmesi.
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
}

//Duruma bağlı olan her zaman çalışmayan fonksiyon.
function createAdditionalZeros() {
    var minUncoveredValue = 0;

    //Matriste kalan elemanların en küçük değerinin bulunması.
    for (var row = 0; row < values.length; row++) {
        for (var col = 0; col < values.length; col++) {
            if (lines[row][col] == 0 && (values[row][col] < minUncoveredValue || minUncoveredValue == 0))
                minUncoveredValue = values[row][col];
        }
    }

    //Bulunan küçük değerin diğer matris elemanlarına eklenmesi veya elemanlarından çıkarılması.
    for (var row = 0; row < values.length; row++) {
        for (var col = 0; col < values.length; col++) {
            //Kalan elemansa çıkarılır.
            if (lines[row][col] == 0)
                values[row][col] -= minUncoveredValue;
            //Kesişim noktası ise eklenir.
            else if (lines[row][col] == 2)
                values[row][col] += minUncoveredValue;
        }
    }
}

//Optimizasyon işleminin yapıldığı fonksiyon.
function findOptimization(row) {
    //Her satıra eleman atandığının kontrol edilmesi.
    if (parseInt(row) == rows.length)
        return true;
    //Tüm sütunlar gezilir.
    for (var col = 0; col < values.length; col++) {
        //Eleman 0 ise ve nulunulan sütun satır tarafından kullanılmış ise sütunun atanması ve kullanılmış olarak işaretlenmesi.
        if (parseInt(values[row][col]) == 0 && parseInt(occupiedCols[col]) == 0) {
            rows[row] = col;
            occupiedCols[col] = 1;
            //Diğer satırlara farklı sütunlardan eleman atanmış ise işlemin tamamlanması eğer atanmamış ise başka sütun elemanının denemesi.
            if (findOptimization(row + 1))
                return true;
            occupiedCols[col] = 0;
        }
    }
    //Eğer hiç eleman atanamamış ise başka sütundan eleman denemek için satırda geriye gidilir.
    return false;
}

function optimization() {
    return findOptimization(0);
}

//Satırlardan seçilmiş eleman dizilerini döndüren fonksiyon.
function getResult() {
    return rows;
}

//Satırlardaki elemanları toplayarak problemin sonucunu döndüren fonksiyon.
function getTotal() {
    var total = 0;
    for (var row = 0; row < values.length; row++)
        total += parseInt(originalValues[row][parseInt(rows[row])]);
    return total;
}