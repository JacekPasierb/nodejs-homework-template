# Dokumentacja Aplikacji Express.js

Ta dokumentacja opisuje podstawy działania aplikacji Express.js, która wykorzystuje Mongoose do połączenia z bazą danych MongoDB.

## Instalacja

Aby uruchomić tę aplikację na swoim środowisku, wykonaj następujące kroki:

1. Sklonuj repozytorium z kodem źródłowym.

2. Utwórz plik `.env` w głównym katalogu projektu i skonfiguruj zmienne środowiskowe, takie jak `DATABASE_URL` i `PORT`.

3. Uruchom `npm install` w katalogu projektu, aby zainstalować wszystkie niezbędne zależności.

4. Uruchom aplikację za pomocą komendy `npm start`.

## Użycie

Aplikacja Express.js działa jako serwer RESTful API. Oto główne funkcje i trasy:

- `/api/contacts`: Trasy związane z zarządzaniem kontaktami.
- `/api/users`: Trasy związane z autoryzacją użytkowników.
- `/api/upload`: Trasy związane z przesyłaniem plików.

Aplikacja obsługuje również statyczne pliki z folderu `public`.

## Obsługa Błędów

Aplikacja jest wyposażona w obsługę błędów, która zawiera:

- Obsługę błędów 404, gdy nie znaleziono żądanej ścieżki.
- Obsługę ogólnych błędów serwera, które mogą wystąpić podczas działania aplikacji.

## Konfiguracja

Konfiguracja aplikacji znajduje się w pliku `config/config.js`. Wartości takie jak `AVATARS_PATH` i `TMP_DIR` można dostosować do własnych potrzeb.

## Baza Danych

Aplikacja łączy się z bazą danych MongoDB. Adres bazy danych można skonfigurować za pomocą zmiennej `DATABASE_URL` w pliku `.env`.

## Rozwijanie Aplikacji

Aplikację można rozwijać, dodając nowe trasy, funkcje i middleware zgodnie z potrzebami projektu. Warto również pamiętać o regularnym aktualizowaniu dokumentacji w miarę dodawania nowych funkcji.

## Autor

Ta aplikacja została stworzona przez Jacek Pasierb. Możesz skontaktować się z autorem pod adresem email_fikcyjny@fikcyjny.pl.

---


