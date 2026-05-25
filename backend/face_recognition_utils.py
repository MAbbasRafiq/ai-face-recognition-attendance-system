import os
import pickle
import cv2
import numpy as np
from deepface import DeepFace

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
STUDENTS_DIR = "data/students"
ENCODINGS_FILE = "data/encodings.pkl"
HAARCASCADE_PATH = "data/haarcascade_frontalface_default.xml"


def register_student_photos(student_id: str, student_name: str, img_count: int = 25):
    """
    Opens the webcam and captures `img_count` face photos for a student.
    Photos are saved in:  data/students/{student_id}_{student_name}/

    Returns the folder name where images were saved.
    """
    folder_name = f"{student_id}_{student_name}"
    save_path = os.path.join(STUDENTS_DIR, folder_name)
    os.makedirs(save_path, exist_ok=True)

    face_cascade = cv2.CascadeClassifier(HAARCASCADE_PATH)
    camera = cv2.VideoCapture(0)

    count = 0
    while count < img_count:
        success, frame = camera.read()
        if not success:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

        for (x, y, w, h) in faces:
            # Crop just the face area and save it
            face_image = gray[y:y + h, x:x + w]
            image_filename = os.path.join(save_path, f"img_{count + 1}.jpg")
            cv2.imwrite(image_filename, face_image)
            count += 1

            # Draw a rectangle around the face so the user can see it
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

        cv2.imshow("Registering - press Q to stop early", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    camera.release()
    cv2.destroyAllWindows()

    return folder_name


def generate_encodings():
    """
    Reads every student photo from data/students/, generates a face embedding
    (a list of numbers that uniquely describes each face) using DeepFace + FaceNet,
    and saves all embeddings to data/encodings.pkl.

    Returns how many embeddings were created.
    """
    os.makedirs(STUDENTS_DIR, exist_ok=True)

    all_embeddings = []
    all_names = []

    for student_folder in os.listdir(STUDENTS_DIR):
        student_path = os.path.join(STUDENTS_DIR, student_folder)

        # Skip files, only process folders
        if not os.path.isdir(student_path):
            continue

        for image_name in os.listdir(student_path):
            image_path = os.path.join(student_path, image_name)
            try:
                # DeepFace.represent() converts a face photo into a list of numbers
                result = DeepFace.represent(
                    img_path=image_path,
                    model_name="Facenet",
                    enforce_detection=False
                )
                all_embeddings.append(result[0]["embedding"])
                all_names.append(student_folder)
            except Exception as error:
                print(f"Skipping {image_path} because: {error}")

    # Save everything to a file so we don't recalculate every time
    data_to_save = {
        "encodings": all_embeddings,
        "names": all_names
    }
    with open(ENCODINGS_FILE, "wb") as file:
        pickle.dump(data_to_save, file)

    return len(all_embeddings)


def find_best_match(live_embedding, known_embeddings, known_names, threshold=1.2):
    """
    Compares a live face embedding against all stored embeddings.
    Returns the name of the closest match, or "Unknown" if no good match.

    threshold: lower = stricter matching. 1.2 works well for FaceNet.
    """
    distances = np.linalg.norm(
        np.array(known_embeddings) - np.array(live_embedding),
        axis=1
    )
    closest_index = np.argmin(distances)
    closest_distance = distances[closest_index]

    if closest_distance < threshold:
        return known_names[closest_index], closest_distance
    else:
        return "Unknown", closest_distance


def run_live_recognition(subject: str, mark_attendance_callback):
    """
    Opens the webcam and continuously recognises faces using the saved encodings.
    When a face is recognised, calls mark_attendance_callback(student_folder_name, subject).

    mark_attendance_callback should return True if attendance was newly marked,
    False if it was already marked for today.
    """
    if not os.path.exists(ENCODINGS_FILE):
        raise FileNotFoundError("Encodings file not found. Please generate encodings first.")

    with open(ENCODINGS_FILE, "rb") as file:
        saved_data = pickle.load(file)

    known_embeddings = saved_data["encodings"]
    known_names = saved_data["names"]

    camera = cv2.VideoCapture(0)

    while True:
        success, frame = camera.read()
        if not success:
            break

        recognized_name = "Unknown"
        status_text = ""

        try:
            # DeepFace.find() searches the student database for a matching face
            results = DeepFace.find(
                img_path=frame,
                db_path=STUDENTS_DIR,
                model_name="Facenet",
                enforce_detection=False
            )

            if len(results) > 0 and not results[0].empty:
                # The identity column contains the full file path
                identity_path = results[0].iloc[0]["identity"]

                # Extract the folder name (which is "studentid_studentname")
                # Works on both Windows (\) and Linux (/)
                parts = identity_path.replace("\\", "/").split("/")
                recognized_name = parts[-2]  # second-to-last part is the folder name

                was_marked = mark_attendance_callback(recognized_name, subject)
                status_text = "Marked!" if was_marked else "Already Marked"

        except Exception as error:
            print(f"Recognition error: {error}")

        # Write the name on the video frame
        color = (0, 255, 0) if recognized_name != "Unknown" else (0, 0, 255)
        cv2.putText(frame, f"{recognized_name} {status_text}", (30, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)

        cv2.imshow(f"Taking Attendance - {subject} - press Q to stop", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    camera.release()
    cv2.destroyAllWindows()
