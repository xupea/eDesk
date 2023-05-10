#include "utils.h"

#include "../vender/robotjs/mouse.h"
#include "../vender/robotjs/deadbeef_rand.h"
#include "../vender/robotjs/keypress.h"
#include "../vender/robotjs/screen.h"
#include "../vender/robotjs/microsleep.h"

using namespace std;

#ifdef __cplusplus
extern "C"
{
#endif

void moveMouseMediator(string params);
void mouseClickMediator(string params);
void dragMouseMediator(string params);
void mouseToggleMediator(string params);

void keyTapMediator(string params);

#ifdef __cplusplus
}
#endif
