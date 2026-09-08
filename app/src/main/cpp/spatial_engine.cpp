#include <jni.h>
#include <cmath>
#include <vector>

static double distanceMeters(double lat1, double lon1, double lat2, double lon2) {
    constexpr double r = 6378137.0;
    const double p1 = lat1 * M_PI / 180.0, p2 = lat2 * M_PI / 180.0;
    const double dp = (lat2 - lat1) * M_PI / 180.0;
    const double dl = (lon2 - lon1) * M_PI / 180.0;
    const double a = std::sin(dp / 2) * std::sin(dp / 2) + std::cos(p1) * std::cos(p2) * std::sin(dl / 2) * std::sin(dl / 2);
    return 2.0 * r * std::atan2(std::sqrt(a), std::sqrt(1.0 - a));
}
extern "C" JNIEXPORT jdouble JNICALL Java_com_opencadatlas_mobile_spatial_SpatialNative_polygonAreaMetersSquared(JNIEnv* env, jobject, jdoubleArray input) {
    const jsize n = env->GetArrayLength(input); if (n < 6 || n % 2 != 0) return 0.0;
    jdouble* p = env->GetDoubleArrayElements(input, nullptr); const double lat0 = p[0], lon0 = p[1]; std::vector<std::pair<double,double>> xy;
    for (int i = 0; i < n; i += 2) { const double lat = p[i], lon = p[i + 1]; const double x = distanceMeters(lat0, lon0, lat0, lon) * (lon >= lon0 ? 1 : -1); const double y = distanceMeters(lat0, lon0, lat, lon0) * (lat >= lat0 ? 1 : -1); xy.emplace_back(x, y); }
    double area = 0.0; for (size_t i = 0; i < xy.size(); ++i) { const auto& a = xy[i]; const auto& b = xy[(i + 1) % xy.size()]; area += a.first * b.second - b.first * a.second; }
    env->ReleaseDoubleArrayElements(input, p, JNI_ABORT); return std::abs(area) / 2.0;
}
extern "C" JNIEXPORT jdouble JNICALL Java_com_opencadatlas_mobile_spatial_SpatialNative_polygonPerimeterMeters(JNIEnv* env, jobject, jdoubleArray input) {
    const jsize n = env->GetArrayLength(input); if (n < 4 || n % 2 != 0) return 0.0; jdouble* p = env->GetDoubleArrayElements(input, nullptr); double total = 0.0;
    for (int i = 0; i < n; i += 2) { const int j = (i + 2) % n; total += distanceMeters(p[i], p[i + 1], p[j], p[j + 1]); }
    env->ReleaseDoubleArrayElements(input, p, JNI_ABORT); return total;
}
extern "C" JNIEXPORT jdoubleArray JNICALL Java_com_opencadatlas_mobile_spatial_SpatialNative_simplifyPolyline(JNIEnv* env, jobject, jdoubleArray input, jdouble tolerance) {
    const jsize n = env->GetArrayLength(input); if (n <= 4 || n % 2 != 0) return input; jdouble* p = env->GetDoubleArrayElements(input, nullptr); std::vector<jdouble> out{p[0], p[1]};
    for (int i = 2; i < n - 2; i += 2) { if (distanceMeters(p[i], p[i + 1], out[out.size() - 2], out[out.size() - 1]) >= tolerance) { out.push_back(p[i]); out.push_back(p[i + 1]); } }
    out.push_back(p[n - 2]); out.push_back(p[n - 1]); env->ReleaseDoubleArrayElements(input, p, JNI_ABORT); jdoubleArray result = env->NewDoubleArray(static_cast<jsize>(out.size())); env->SetDoubleArrayRegion(result, 0, static_cast<jsize>(out.size()), out.data()); return result;
}
