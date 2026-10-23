<?php

namespace App\Enums;

enum BusinessLegalForm: string
{
    case Pt = 'pt';
    case Cv = 'cv';
    case Firma = 'firma';
    case Koperasi = 'koperasi';
    case Yayasan = 'yayasan';
    case Perorangan = 'perorangan';
    case Lainnya = 'lainnya';
}
